import type {
  Customer,
} from "../../types";

type CustomerTableProps = {
  customers: Customer[];
  loading: boolean;
  onSelectCustomer: (
    customer: Customer
  ) => void;
};

function CustomerTable({
  customers,
  loading,
  onSelectCustomer,
}: CustomerTableProps) {
  return (
    <section className="invoice-section">
      <div className="section-heading">
        <div>
          <h3>Customers</h3>

          <p>
            Customer accounts
            and contact information
          </p>
        </div>
      </div>

      <div className="invoice-table">
        <div className="table-row table-header">
          <span>Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Facilities</span>
          <span>Jobs</span>
        </div>

        {loading ? (
          <div className="table-row">
            <span>
              Loading customers...
            </span>
          </div>
        ) : customers.length === 0 ? (
          <div className="table-row">
            <span>
              No customers yet.
            </span>
          </div>
        ) : (
          customers.map(
            (customer) => {
              const facilities =
                customer.facilities ||
                [];

              const jobCount =
                facilities.reduce(
                  (
                    total,
                    facility
                  ) =>
                    total +
                    (
                      facility.jobs ||
                      []
                    ).length,
                  0
                );

              return (
                <div
                  className="table-row invoice-row"
                  key={customer.id}
                  onClick={() =>
                    onSelectCustomer(
                      customer
                    )
                  }
                >
                  <strong>
                    {customer.name}
                  </strong>

                  <span>
                    {customer.email ||
                      "—"}
                  </span>

                  <span>
                    {customer.phone ||
                      "—"}
                  </span>

                  <span>
                    {
                      facilities.length
                    }
                  </span>

                  <span>
                    {jobCount}
                  </span>
                </div>
              );
            }
          )
        )}
      </div>
    </section>
  );
}

export default CustomerTable;