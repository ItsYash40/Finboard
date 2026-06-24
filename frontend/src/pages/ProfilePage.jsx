import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Landmark, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { api, getApiError } from "../lib/api.js";
import { bankingApi } from "../lib/bankingApi.js";
import { formatDate, maskEmail, maskPan, maskPhone } from "../lib/format.js";
import { useAuth } from "../state/AuthContext.jsx";

const menuItems = [
  "Basic Details",
  "Bank Details",
  "Reports",
  "Change Password",
  "Change Groww PIN",
  "Trading controls",
  "Trading APIs",
  "Sell authorisation mode",
  "Trading Details",
  "Account Related Forms",
  "Nominee Details",
  "Active Devices",
  "Report suspicious activity"
];

const blankProfile = {
  fullName: "",
  dateOfBirth: "",
  pan: "",
  mobileNumber: "",
  emailAddress: "",
  maritalStatus: "",
  gender: "",
  incomeRange: "",
  occupation: "",
  fatherName: "",
  motherName: "",
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India"
  },
  bank: {
    accountHolderName: "",
    accountNumberMasked: "",
    ifsc: "",
    bankName: ""
  }
};

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(blankProfile);
  const [activeSection, setActiveSection] = useState(searchParams.get("section") || "Basic Details");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bankForm, setBankForm] = useState({ accountHolderName: "", accountNumber: "", ifsc: "DEMO0000001" });

  const linkedAccounts = useQuery({
    queryKey: ["linked-bank-accounts"],
    queryFn: bankingApi.linkedAccounts,
    enabled: activeSection === "Bank Details"
  });

  const verifyBank = useMutation({
    mutationFn: bankingApi.verifyBank,
    onSuccess() {
      toast.success("Bank account added. Rs. 2 debit will be refunded soon.");
      setBankForm({ accountHolderName: "", accountNumber: "", ifsc: "DEMO0000001" });
      queryClient.invalidateQueries({ queryKey: ["linked-bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["banking-summary"] });
      queryClient.invalidateQueries({ queryKey: ["navbar-bank-notifications"] });
    },
    onError(error) {
      toast.error(getApiError(error));
    }
  });

  const removeBank = useMutation({
    mutationFn: bankingApi.removeAccount,
    onSuccess() {
      toast.success("Bank account removed from profile");
      queryClient.invalidateQueries({ queryKey: ["linked-bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["banking-summary"] });
    },
    onError(error) {
      toast.error(getApiError(error));
    }
  });

  useEffect(() => {
    const section = searchParams.get("section");
    if (section && menuItems.includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get("/profile/me");
        setProfile({ ...blankProfile, ...response.data.profile });
      } catch (error) {
        toast.error(getApiError(error));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const displayRows = useMemo(
    () => [
      ["Full Name", profile.fullName || "Not added", false],
      ["Date of Birth", formatDate(profile.dateOfBirth), false],
      ["Mobile Number", maskPhone(profile.mobileNumber), true],
      ["Email Address", maskEmail(profile.emailAddress), true],
      ["Marital Status", profile.maritalStatus || "Not added", true],
      ["Gender", profile.gender || "Not added", false],
      ["Income Range", profile.incomeRange || "Not added", true],
      ["Occupation", profile.occupation || "Not added", false],
      ["Father's Name", profile.fatherName || "Not added", true],
      [
        "Address",
        [profile.address?.line1, profile.address?.line2, profile.address?.city, profile.address?.state, profile.address?.postalCode]
          .filter(Boolean)
          .join(", ") || "Not added",
        false
      ]
    ],
    [profile]
  );

  function updateField(path, value) {
    setProfile((current) => {
      if (!path.includes(".")) {
        return { ...current, [path]: value };
      }

      const [parent, child] = path.split(".");
      return {
        ...current,
        [parent]: {
          ...current[parent],
          [child]: value
        }
      };
    });
  }

  async function saveProfile(event) {
    event.preventDefault();
    try {
      const response = await api.put("/profile/me", profile);
      setProfile({ ...blankProfile, ...response.data.profile });
      setEditing(false);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getApiError(error));
    }
  }

  return (
    <div className="app-surface">
      <Navbar />
      <main className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-identity">
            <div className="large-avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
            <h2>{profile.fullName || user?.name || "Your Name"}</h2>
          </div>
          <nav>
            {menuItems.map((item, index) => (
              <button className={activeSection === item ? "active" : ""} type="button" key={item} onClick={() => setActiveSection(item)}>
                {item}
                <ChevronRight size={17} />
              </button>
            ))}
          </nav>
        </aside>

        <section className="profile-card">
          <div className="profile-card-header">
            <div>
              <h1>{activeSection === "Bank Details" ? "Bank Details" : "Personal Details"}</h1>
              <p>{activeSection === "Bank Details" ? "Add or remove verified dummy bank accounts" : `PAN - ${maskPan(profile.pan)}`}</p>
            </div>
            {activeSection === "Basic Details" ? (
              <button className="secondary-button" type="button" onClick={() => setEditing((value) => !value)}>
                <Pencil size={16} />
                {editing ? "View" : "Edit details"}
              </button>
            ) : null}
          </div>

          {activeSection === "Bank Details" ? (
            <div className="profile-bank-section">
              <form
                className="profile-form bank-profile-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  verifyBank.mutate(bankForm);
                }}
              >
                <div className="form-grid">
                  <label>
                    Account holder name
                    <input value={bankForm.accountHolderName} onChange={(event) => setBankForm({ ...bankForm, accountHolderName: event.target.value })} placeholder="Rahul Sharma" />
                  </label>
                  <label>
                    Account number
                    <input value={bankForm.accountNumber} onChange={(event) => setBankForm({ ...bankForm, accountNumber: event.target.value })} placeholder="100000000002" />
                  </label>
                  <label>
                    IFSC
                    <input value={bankForm.ifsc} onChange={(event) => setBankForm({ ...bankForm, ifsc: event.target.value.toUpperCase() })} />
                  </label>
                </div>
                <button className="primary-button compact" type="submit" disabled={verifyBank.isPending}>
                  Add bank and debit Rs. 2
                </button>
              </form>

              <div className="linked-account-list">
                {(linkedAccounts.data || []).map((account) => (
                  <div className="linked-account-row" key={account.id}>
                    <div className="metric-icon"><Landmark size={19} /></div>
                    <div>
                      <strong>{account.holderName}</strong>
                      <p>{account.bankName || "Finboard Demo Bank"} / {account.accountNumber} / {account.ifsc}</p>
                      <span>Balance: Rs. {Number(account.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <button type="button" className="icon-danger" onClick={() => removeBank.mutate(account.id)} disabled={removeBank.isPending}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
                {!linkedAccounts.data?.length ? <p className="profile-loading">No linked bank account yet. Add one using seeded dummy bank details.</p> : null}
              </div>
            </div>
          ) : loading ? (
            <div className="profile-loading">Loading profile...</div>
          ) : editing ? (
            <form className="profile-form" onSubmit={saveProfile}>
              <div className="form-grid">
                <label>
                  Full name
                  <input value={profile.fullName || ""} onChange={(event) => updateField("fullName", event.target.value)} />
                </label>
                <label>
                  Date of birth
                  <input type="date" value={profile.dateOfBirth?.slice?.(0, 10) || ""} onChange={(event) => updateField("dateOfBirth", event.target.value)} />
                </label>
                <label>
                  PAN
                  <input value={profile.pan || ""} onChange={(event) => updateField("pan", event.target.value.toUpperCase())} placeholder="ABCDE1234F" />
                </label>
                <label>
                  Mobile number
                  <input value={profile.mobileNumber || ""} onChange={(event) => updateField("mobileNumber", event.target.value)} />
                </label>
                <label>
                  Email
                  <input value={profile.emailAddress || ""} onChange={(event) => updateField("emailAddress", event.target.value)} />
                </label>
                <label>
                  Marital status
                  <select value={profile.maritalStatus || ""} onChange={(event) => updateField("maritalStatus", event.target.value)}>
                    <option value="">Select</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  Gender
                  <select value={profile.gender || ""} onChange={(event) => updateField("gender", event.target.value)}>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </label>
                <label>
                  Income range
                  <select value={profile.incomeRange || ""} onChange={(event) => updateField("incomeRange", event.target.value)}>
                    <option value="">Select</option>
                    <option>Below 1 Lac</option>
                    <option>1 Lac - 5 Lac</option>
                    <option>5 Lac - 10 Lac</option>
                    <option>10 Lac - 25 Lac</option>
                    <option>Above 25 Lac</option>
                  </select>
                </label>
                <label>
                  Occupation
                  <input value={profile.occupation || ""} onChange={(event) => updateField("occupation", event.target.value)} />
                </label>
                <label>
                  Father's name
                  <input value={profile.fatherName || ""} onChange={(event) => updateField("fatherName", event.target.value)} />
                </label>
                <label>
                  Address line 1
                  <input value={profile.address?.line1 || ""} onChange={(event) => updateField("address.line1", event.target.value)} />
                </label>
                <label>
                  Address line 2
                  <input value={profile.address?.line2 || ""} onChange={(event) => updateField("address.line2", event.target.value)} />
                </label>
                <label>
                  City
                  <input value={profile.address?.city || ""} onChange={(event) => updateField("address.city", event.target.value)} />
                </label>
                <label>
                  State
                  <input value={profile.address?.state || ""} onChange={(event) => updateField("address.state", event.target.value)} />
                </label>
                <label>
                  Postal code
                  <input value={profile.address?.postalCode || ""} onChange={(event) => updateField("address.postalCode", event.target.value)} />
                </label>
              </div>
              <button className="primary-button compact" type="submit">Save profile</button>
            </form>
          ) : (
            <div className="detail-list">
              {displayRows.map(([label, value, editable]) => (
                <div className="detail-row" key={label}>
                  <div>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                  {editable ? <Pencil size={16} /> : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
