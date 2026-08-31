import {
  useState,
  type FormEvent,
} from "react";

import { API_URL } from "../../services/api";

type FacilityFormProps = {
  customerId: number;
  onCancel: () => void;
  onSaved: () => void;
};

function FacilityForm({
  customerId,
  onCancel,
  onSaved,
}: FacilityFormProps) {
  const [name, setName] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  const [zipCode, setZipCode] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError(
        "Facility name is required."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await fetch(
          `${API_URL}/api/facilities`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name:
                name.trim(),

              address:
                address.trim() ||
                null,

              city:
                city.trim() ||
                null,

              state:
                state.trim() ||
                null,

              zipCode:
                zipCode.trim() ||
                null,

              notes:
                notes.trim() ||
                null,

              customerId,
            }),
          }
        );

      if (!response.ok) {
        let message =
          "Unable to create facility.";

        try {
          const data =
            await response.json();

          if (data.message) {
            message =
              data.message;
          }
        } catch {
          // Ignore non-JSON errors
        }

        throw new Error(
          message
        );
      }

      onSaved();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create facility."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            Longbranch Automation
            & Controls
          </p>

          <h2>
            New Facility
          </h2>

          <p className="subtitle">
            Add a customer
            location or site.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={
            onCancel
          }
        >
          Back to Customer
        </button>
      </header>

      <form
        className="invoice-form"
        onSubmit={
          handleSubmit
        }
      >
        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <section className="form-card">
          <div className="form-card-header">
            <div>
              <h3>
                Facility Details
              </h3>

              <p>
                Location and site
                information.
              </p>
            </div>
          </div>

          <div className="form-grid">
            <label>
              <span>
                Facility Name
              </span>

              <input
                type="text"
                value={name}
                onChange={(
                  event
                ) =>
                  setName(
                    event.target
                      .value
                  )
                }
                placeholder="Main Plant"
              />
            </label>

            <label>
              <span>
                Address
              </span>

              <input
                type="text"
                value={address}
                onChange={(
                  event
                ) =>
                  setAddress(
                    event.target
                      .value
                  )
                }
                placeholder="123 Industrial Way"
              />
            </label>

            <label>
              <span>
                City
              </span>

              <input
                type="text"
                value={city}
                onChange={(
                  event
                ) =>
                  setCity(
                    event.target
                      .value
                  )
                }
                placeholder="Columbus"
              />
            </label>

            <label>
              <span>
                State
              </span>

              <input
                type="text"
                value={state}
                onChange={(
                  event
                ) =>
                  setState(
                    event.target
                      .value
                  )
                }
                placeholder="GA"
              />
            </label>

            <label>
              <span>
                ZIP Code
              </span>

              <input
                type="text"
                value={zipCode}
                onChange={(
                  event
                ) =>
                  setZipCode(
                    event.target
                      .value
                  )
                }
                placeholder="31901"
              />
            </label>
          </div>
        </section>

        <section className="form-card">
          <div className="form-card-header">
            <div>
              <h3>
                Notes
              </h3>

              <p>
                Optional information
                about this facility.
              </p>
            </div>
          </div>

          <textarea
            rows={6}
            value={notes}
            onChange={(
              event
            ) =>
              setNotes(
                event.target
                  .value
              )
            }
            placeholder="Add facility notes..."
          />
        </section>

        <button
          type="submit"
          className="primary-button"
          disabled={
            saving
          }
        >
          {saving
            ? "Creating Facility..."
            : "Create Facility"}
        </button>
      </form>
    </>
  );
}

export default FacilityForm;