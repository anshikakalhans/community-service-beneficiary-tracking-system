import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./delivery-proof.css";

const DONATIONS_KEY = "tripti_donations";
const PROOFS_KEY = "tripti_delivery_proofs";

// Return today's date in YYYY-MM-DD format using the local timezone.
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// Safely read an array from localStorage.
function readJSON(key, fallback) {
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) {
      return fallback;
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : fallback;
  } catch (error) {
    console.error("Could not read localStorage key:", key, error);
    return fallback;
  }
}

// Save delivery proofs and notify other components in this app.
function saveProofs(proofs) {
  localStorage.setItem(PROOFS_KEY, JSON.stringify(proofs));
  window.dispatchEvent(new Event("tripti-proof-update"));
}

// Compress an uploaded image before saving it in localStorage.
function compressImage(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.onerror = function () {
      reject(new Error("Could not read this image."));
    };

    reader.onload = function () {
      const image = new Image();

      image.onerror = function () {
        reject(new Error("This image could not be opened."));
      };

      image.onload = function () {
        const maxSide = 1200;
        const largestSide = Math.max(image.width, image.height);
        const scale = Math.min(1, maxSide / largestSide);
        const canvas = document.createElement("canvas");

        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Could not process this image."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

function formatAmount(amount) {
  const numericAmount = Number(amount || 0);
  return numericAmount.toLocaleString("en-IN");
}

export function DeliveryProofAdmin() {
  const [donations, setDonations] = useState(function () {
    return readJSON(DONATIONS_KEY, []);
  });

  const [proofs, setProofs] = useState(function () {
    return readJSON(PROOFS_KEY, []);
  });

  const [form, setForm] = useState({
    donationId: "",
    beneficiary: "",
    deliveredDate: getTodayDate(),
    description: "",
  });

  const [photo, setPhoto] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(function () {
    function refreshData() {
      setDonations(readJSON(DONATIONS_KEY, []));
      setProofs(readJSON(PROOFS_KEY, []));
    }

    window.addEventListener("tripti-update", refreshData);
    window.addEventListener("tripti-proof-update", refreshData);
    window.addEventListener("storage", refreshData);

    return function () {
      window.removeEventListener("tripti-update", refreshData);
      window.removeEventListener("tripti-proof-update", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  function updateField(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    setForm(function (currentForm) {
      return {
        ...currentForm,
        [fieldName]: fieldValue,
      };
    });
  }

  async function handlePhoto(event) {
    const file = event.target.files && event.target.files[0];

    setError("");
    setMessage("");

    if (!file) {
      return;
    }

    if (file.type && file.type.indexOf("image/") !== 0) {
      setError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    try {
      const compressedPhoto = await compressImage(file);
      setPhoto(compressedPhoto);
      setPhotoName(file.name);
    } catch (photoError) {
      console.error(photoError);
      setPhoto("");
      setPhotoName("");
      setError("Could not process this image. Please choose another photo.");
    }
  }

  function removePhoto() {
    setPhoto("");
    setPhotoName("");
  }

  function submitProof(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.donationId) {
      setError("Please select the related donation.");
      return;
    }

    if (!form.beneficiary.trim()) {
      setError("Please enter the beneficiary or receiving organisation.");
      return;
    }

    if (!form.deliveredDate) {
      setError("Please select the delivery date.");
      return;
    }

    if (!photo) {
      setError("Please upload a delivery photo.");
      return;
    }

    const selectedDonation = donations.find(function (donation) {
      return String(donation.id) === String(form.donationId);
    });

    if (!selectedDonation) {
      setError("The selected donation was not found. Please refresh and try again.");
      return;
    }

    const newProof = {
      id: "proof-" + Date.now(),
      donationId: selectedDonation.id,
      donor: selectedDonation.donor || "Donor",
      anonymous: Boolean(selectedDonation.anonymous),
      cause: selectedDonation.cause || "General Donation",
      amount: Number(selectedDonation.amount || 0),
      beneficiary: form.beneficiary.trim(),
      deliveredDate: form.deliveredDate,
      description: form.description.trim(),
      image: photo,
      status: "Delivered",
      createdAt: new Date().toISOString(),
    };

    setIsSaving(true);

    try {
      const existingProofs = readJSON(PROOFS_KEY, []);
      const updatedProofs = [newProof].concat(existingProofs);

      saveProofs(updatedProofs);
      setProofs(updatedProofs);

      setForm({
        donationId: "",
        beneficiary: "",
        deliveredDate: getTodayDate(),
        description: "",
      });

      setPhoto("");
      setPhotoName("");
      event.target.reset();
      setMessage("Delivery proof saved successfully.");
    } catch (saveError) {
      console.error(saveError);
      setError("The image could not be saved. Try a smaller photo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="proofPage">
      <header className="proofPageHeader">
        <div>
          <span className="proofEyebrow">TRIPTI FOUNDATION · ADMIN</span>
          <h1>Add Delivery Proof</h1>
          <p>Upload a genuine photo after donated items have reached the beneficiary.</p>
        </div>
        <a className="proofSecondaryButton" href="/delivery-proof">
          View public gallery
        </a>
      </header>

      <section className="proofFormCard">
        <h2>Record successful delivery</h2>
        <p className="proofHint">
          Select the donation, enter the beneficiary details, and upload a delivery photo.
        </p>

        {donations.length === 0 ? (
          <p className="proofNotice">
            No donation records were found. Add a donation first, then return here.
          </p>
        ) : (
          <form className="proofForm" onSubmit={submitProof}>
            <label>
              Related donation
              <select
                name="donationId"
                value={form.donationId}
                onChange={updateField}
                required
              >
                <option value="">Select a donation</option>
                {donations.map(function (donation) {
                  const donorName = donation.anonymous
                    ? "Anonymous Donor"
                    : donation.donor || "Donor";

                  return (
                    <option key={donation.id} value={donation.id}>
                      {donorName} - {donation.cause || "General Donation"} - ₹
                      {formatAmount(donation.amount)} - {donation.date || "Date not available"}
                    </option>
                  );
                })}
              </select>
            </label>

            <div className="proofFormGrid">
              <label>
                Beneficiary / receiving organisation
                <input
                  type="text"
                  name="beneficiary"
                  value={form.beneficiary}
                  onChange={updateField}
                  placeholder="Enter beneficiary name"
                  required
                />
              </label>

              <label>
                Delivery date
                <input
                  type="date"
                  name="deliveredDate"
                  value={form.deliveredDate}
                  onChange={updateField}
                  required
                />
              </label>
            </div>

            <label>
              What was delivered? (optional)
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
                placeholder="Example: 10 notebooks, 5 school bags and stationery kits"
                rows={3}
              />
            </label>

            <label className="proofUploadBox">
              <span className="proofUploadIcon">+</span>
              <strong>Upload delivery photo</strong>
              <small>
                Choose a clear photo showing the items being handed over or received.
              </small>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                required={!photo}
              />
              {photoName ? <span className="proofFileName">{photoName}</span> : null}
            </label>

            {photo ? (
              <div className="proofPreview">
                <img src={photo} alt="Delivery proof preview" />
                <button
                  type="button"
                  className="proofRemovePhoto"
                  onClick={removePhoto}
                >
                  Remove photo
                </button>
              </div>
            ) : null}

            {error ? <p className="proofError" role="alert">{error}</p> : null}
            {message ? <p className="proofSuccess" role="status">{message}</p> : null}

            <button
              className="proofPrimaryButton"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save delivery proof"}
            </button>
          </form>
        )}
      </section>

      <p className="proofDisclaimer">
        Important: upload genuine delivery photos and mark an item as delivered only after
        confirming receipt. This demo stores images in this browser only; it does not provide
        shared cloud storage.
      </p>

      <section className="proofExisting">
        <h2>Recently uploaded proofs</h2>
        {proofs.length === 0 ? (
          <p className="proofEmpty">No delivery proofs have been uploaded yet.</p>
        ) : (
          <div className="proofMiniGrid">
            {proofs.slice(0, 4).map(function (proof) {
              return (
                <article className="proofMiniCard" key={proof.id}>
                  <img src={proof.image} alt={"Delivery proof for " + proof.cause} />
                  <div>
                    <strong>{proof.cause}</strong>
                    <span>{proof.beneficiary}</span>
                    <small>{proof.deliveredDate}</small>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export function DeliveryProofHomePreview() {
  const [proofs, setProofs] = useState(function () {
    return readJSON(PROOFS_KEY, []);
  });

  useEffect(function () {
    function refreshProofs() {
      setProofs(readJSON(PROOFS_KEY, []));
    }

    window.addEventListener("tripti-proof-update", refreshProofs);
    window.addEventListener("storage", refreshProofs);

    return function () {
      window.removeEventListener("tripti-proof-update", refreshProofs);
      window.removeEventListener("storage", refreshProofs);
    };
  }, []);

  const latestProofs = proofs.slice(0, 3);

  return (
    <section className="proofHomeSection">
      <div className="proofHomeHeading">
        <div>
          <span className="proofEyebrow">REAL IMPACT · REAL STORIES</span>
          <h2>Live Delivery Updates</h2>
          <p>See how your contributions are reaching people in need.</p>
        </div>
        <span className="proofHomeLive"><i /> LIVE</span>
      </div>

      {latestProofs.length === 0 ? (
        <div className="proofHomeEmpty">
          Delivery photos and updates will appear here as soon as they are uploaded.
        </div>
      ) : (
        <div className="proofHomeGrid">
          {latestProofs.map(function (proof) {
            return (
              <article className="proofHomeCard" key={proof.id}>
                <img src={proof.image} alt={"Delivery proof for " + proof.cause} />
                <div className="proofHomeCardBody">
                  <div className="proofHomeCardTop">
                    <span className="proofDeliveredBadge">✓ Delivered</span>
                    <small>{proof.deliveredDate}</small>
                  </div>
                  <h3>{proof.cause}</h3>
                  <p>Received by: <strong>{proof.beneficiary}</strong></p>
                  {proof.description ? <p>{proof.description}</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="proofHomeFooter">
        <Link to="/delivery-proof">View all delivery proofs <span>→</span></Link>
      </div>
    </section>
  );
}

export function DeliveryProofGallery() {
  const [proofs, setProofs] = useState(function () {
    return readJSON(PROOFS_KEY, []);
  });

  useEffect(function () {
    function refreshProofs() {
      setProofs(readJSON(PROOFS_KEY, []));
    }

    window.addEventListener("tripti-proof-update", refreshProofs);
    window.addEventListener("storage", refreshProofs);

    return function () {
      window.removeEventListener("tripti-proof-update", refreshProofs);
      window.removeEventListener("storage", refreshProofs);
    };
  }, []);

  return (
    <main className="proofPage">
      <header className="proofPageHeader">
        <div>
          <span className="proofEyebrow">TRIPTI FOUNDATION · TRANSPARENCY</span>
          <h1>Delivery Proof Gallery</h1>
          <p>See photos and updates confirming that support has reached beneficiaries.</p>
        </div>
      </header>

      {proofs.length === 0 ? (
        <section className="proofEmptyState">
          <div>♡</div>
          <h2>Delivery stories will appear here</h2>
          <p>
            Once the foundation uploads a delivery photo, donors will be able to view it here.
          </p>
        </section>
      ) : (
        <section className="proofGalleryGrid">
          {proofs.map(function (proof) {
            return (
              <article className="proofGalleryCard" key={proof.id}>
                <img
                  src={proof.image}
                  alt={"Proof of " + proof.cause + " delivery"}
                />
                <div className="proofGalleryBody">
                  <div className="proofGalleryTop">
                    <span className="proofDeliveredBadge">✓ Delivered</span>
                    <small>{proof.deliveredDate}</small>
                  </div>

                  <h2>{proof.cause}</h2>
                  <p className="proofBeneficiary">
                    Received by: <strong>{proof.beneficiary}</strong>
                  </p>

                  {proof.description ? <p>{proof.description}</p> : null}

                  <div className="proofDonationMeta">
                    <span>
                      Donor: {proof.anonymous ? "Anonymous Donor" : proof.donor || "Donor"}
                    </span>
                    <strong>₹{formatAmount(proof.amount)}</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <p className="proofDisclaimer">
        Photos are uploaded by the foundation as delivery evidence. Contact the foundation if
        you need additional verification about a specific donation.
      </p>
    </main>
  );
}

export default DeliveryProofAdmin;
