import { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

type CreateUserProps = {
  onDone: () => void;
};

function CreateUser({
  onDone,
}: CreateUserProps) {
  const [name, setName] =
    useState("");
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [error, setError] =
    useState("");
  const [success, setSuccess] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    if (password.length < 12) {
      setError(
        "Password must be at least 12 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/employees`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create user"
        );
      }

      setSuccess(
        `${data.employee.name} has been created successfully.`
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create user"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="create-user-page">
      <div className="create-user-header">
        <div>
          <p className="page-eyebrow">
            Administration
          </p>

          <h1>Create User</h1>

          <p>
            Create login credentials
            for an authorized Longbranch
            employee.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={onDone}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="create-user-card">
        <form
          className="create-user-form"
          onSubmit={handleSubmit}
        >
          <div className="create-user-field">
            <label htmlFor="user-name">
              Employee Name
            </label>

            <input
              id="user-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Employee name"
              required
            />
          </div>

          <div className="create-user-field">
            <label htmlFor="user-email">
              Email Address
            </label>

            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="name@company.com"
              autoComplete="off"
              required
            />
          </div>

          <div className="create-user-field">
            <label htmlFor="user-password">
              Temporary Password
            </label>

            <input
              id="user-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Minimum 12 characters"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="create-user-field">
            <label htmlFor="confirm-password">
              Confirm Password
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Re-enter password"
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {success && (
            <div className="create-user-success">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="create-user-submit"
            disabled={loading}
          >
            {loading
              ? "Creating User..."
              : "Create User"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default CreateUser;