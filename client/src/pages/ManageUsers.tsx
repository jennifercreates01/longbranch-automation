import {
  useEffect,
  useState,
} from "react";

import { API_URL } from "../services/api";

type EmployeeUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
};

function ManageUsers() {
  const [users, setUsers] =
    useState<EmployeeUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/employees`,
          {
            credentials: "include",
          }
        );

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.message ||
            "Unable to load users"
        );
      }

      const data:
        EmployeeUser[] =
          await response.json();

      setUsers(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const requirePasswordChange =
    async (
      user: EmployeeUser
    ) => {
      const confirmed =
        window.confirm(
          `Require ${user.name} to change their password the next time they access the portal?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setMessage("");

        const response =
          await fetch(
            `${API_URL}/api/employees/${user.id}/require-password-change`,
            {
              method: "PATCH",
              credentials:
                "include",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to update user"
          );
        }

        setUsers(
          (currentUsers) =>
            currentUsers.map(
              (currentUser) =>
                currentUser.id ===
                user.id
                  ? data
                  : currentUser
            )
        );

        setMessage(
          `${user.name} will be required to change their password.`
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to update user."
        );
      }
    };

  const deleteUser =
    async (
      user: EmployeeUser
    ) => {
      const confirmed =
        window.confirm(
          `Delete ${user.name} (${user.email})?\n\nThis permanently removes their portal account.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setMessage("");

        const response =
          await fetch(
            `${API_URL}/api/employees/${user.id}`,
            {
              method: "DELETE",
              credentials:
                "include",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to delete user"
          );
        }

        setUsers(
          (currentUsers) =>
            currentUsers.filter(
              (currentUser) =>
                currentUser.id !==
                user.id
            )
        );

        setMessage(
          `${user.name} was deleted.`
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to delete user."
        );
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
            Manage Users
          </h2>

          <p className="subtitle">
            Manage employee portal
            accounts and password
            reset requirements.
          </p>
        </div>
      </header>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {message && (
        <div className="form-success">
          {message}
        </div>
      )}

      <section className="form-card">
        <div className="form-card-header">
          <div>
            <h3>
              Employee Accounts
            </h3>

            <p>
              Existing users can be
              forced to change their
              password without deleting
              and recreating the account.
            </p>
          </div>
        </div>

        <div className="invoice-table">
          <div className="table-row table-header">
            <span>
              Employee
            </span>

            <span>
              Email
            </span>

            <span>
              Role
            </span>

            <span>
              Password
            </span>

            <span>
              Actions
            </span>
          </div>

          {loading ? (
            <div className="table-row">
              <span>
                Loading users...
              </span>
            </div>
          ) : users.length === 0 ? (
            <div className="table-row">
              <span>
                No users found.
              </span>
            </div>
          ) : (
            users.map(
              (user) => (
                <div
                  className="table-row"
                  key={user.id}
                >
                  <strong>
                    {user.name}
                  </strong>

                  <span>
                    {user.email}
                  </span>

                  <span>
                    {user.role}
                  </span>

                  <span>
                    {user.mustChangePassword
                      ? "Change required"
                      : "Current"}
                  </span>

                  <span
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        requirePasswordChange(
                          user
                        )
                      }
                      disabled={
                        user.role ===
                        "ADMIN"
                      }
                    >
                      Require Reset
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() =>
                        deleteUser(
                          user
                        )
                      }
                      disabled={
                        user.role ===
                        "ADMIN"
                      }
                    >
                      Delete
                    </button>
                  </span>
                </div>
              )
            )
          )}
        </div>
      </section>
    </>
  );
}

export default ManageUsers;
