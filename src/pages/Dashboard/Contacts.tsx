import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Eye,
  History,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import api from "../../features/api";
import { useToast } from "../../components/ToastProvider";
import { contactSchema } from "../../validation/formSchemas";

type ContactStatus = "Lead" | "Prospect" | "Customer";

type Contact = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: ContactStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type ActivityLog = {
  _id: string;
  action: "created" | "updated" | "deleted";
  message: string;
  contactName: string;
  userName: string;
  userEmail: string;
  changeDetails?: {
    field: string;
    before?: string;
    after?: string;
  }[];
  createdAt: string;
};

const emptyContactForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "Lead" as ContactStatus,
  notes: "",
};

const contactsPerPage = 10;
const activityLogsPerPage = 3;

const statusBadgeClass: Record<ContactStatus, string> = {
  Lead: "bg-amber-100 text-amber-700",
  Prospect: "bg-blue-100 text-blue-700",
  Customer: "bg-emerald-100 text-emerald-700",
};

const actionBadgeClass: Record<ActivityLog["action"], string> = {
  created: "bg-emerald-100 text-emerald-700",
  updated: "bg-blue-100 text-blue-700",
  deleted: "bg-red-100 text-red-700",
};

const renderChangeDetails = (log: ActivityLog) => {
  if (!log.changeDetails || log.changeDetails.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1 rounded-[4px] bg-neutral-50 p-2">
      {log.changeDetails.map((detail) => (
        <p
          key={`${log._id}-${detail.field}`}
          className="text-xs font-medium text-neutral-600"
        >
          <span className="font-black text-neutral-800">{detail.field}:</span>{" "}
          {log.action === "created" && (
            <span>set to {detail.after || "Empty"}</span>
          )}
          {log.action === "updated" && (
            <span>
              {detail.before || "Empty"} {"->"} {detail.after || "Empty"}
            </span>
          )}
          {log.action === "deleted" && (
            <span>was {detail.before || "Empty"}</span>
          )}
        </p>
      ))}
    </div>
  );
};

const getSerialNumber = (page: number, index: number) =>
  String((page - 1) * activityLogsPerPage + index + 1).padStart(2, "0");

const Contacts = () => {
  const toast = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactLogs, setContactLogs] = useState<ActivityLog[]>([]);
  const [contactLogPage, setContactLogPage] = useState(1);
  const [totalContactLogPages, setTotalContactLogPages] = useState(1);
  const [contactLogTotal, setContactLogTotal] = useState(0);
  const [counts, setCounts] = useState({
    total: 0,
    Lead: 0,
    Prospect: 0,
    Customer: 0,
  });
  const [contactTotal, setContactTotal] = useState(0);
  const [totalContactPages, setTotalContactPages] = useState(1);
  const [contactPage, setContactPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | ContactStatus>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [viewContact, setViewContact] = useState<Contact | null>(null);
  const [activityContact, setActivityContact] = useState<Contact | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const customerRatio = useMemo(() => {
    if (!counts.total) return "0%";
    return `${Math.round((counts.Customer / counts.total) * 100)}%`;
  }, [counts]);

  const contactFormik = useFormik({
    initialValues: emptyContactForm,
    validationSchema: contactSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const nextPage = editingContactId ? contactPage : 1;

        if (editingContactId) {
          const res = await api.patch(`/contacts/${editingContactId}`, values);
          toast.success(res.data.message || "Contact updated");
        } else {
          const res = await api.post("/contacts", values);
          toast.success(res.data.message || "Contact added");
        }

        resetContactForm();
        await loadContacts(nextPage);
        if (editingContactId) {
          await loadContactLogs(editingContactId, 1);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Could not save contact");
      } finally {
        setSaving(false);
      }
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const loadContacts = async (page = 1) => {
    try {
      setLoading(true);
      const contactsRes = await api.get("/contacts", {
        params: {
          page,
          limit: contactsPerPage,
          status: statusFilter,
          search: debouncedSearch,
        },
      });

      setContacts(contactsRes.data.data?.contacts || []);
      setContactTotal(contactsRes.data.data?.pagination?.total || 0);
      setContactPage(contactsRes.data.data?.pagination?.page || page);
      setTotalContactPages(
        contactsRes.data.data?.pagination?.totalPages || 1,
      );
      setCounts(
        contactsRes.data.data?.counts || {
          total: 0,
          Lead: 0,
          Prospect: 0,
          Customer: 0,
        },
      );
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Could not load contacts");
    } finally {
      setLoading(false);
    }
  };

  const loadContactLogs = async (contactId: string, page = 1) => {
    try {
      const logsRes = await api.get(`/activity-logs/contacts/${contactId}`, {
        params: {
          page,
          limit: activityLogsPerPage,
        },
      });
      const payload = logsRes.data.data;

      setContactLogs(payload?.logs || []);
      setContactLogPage(payload?.pagination?.page || page);
      setTotalContactLogPages(payload?.pagination?.totalPages || 1);
      setContactLogTotal(payload?.pagination?.total || 0);
    } catch {
      setContactLogs([]);
      setContactLogPage(1);
      setTotalContactLogPages(1);
      setContactLogTotal(0);
    }
  };

  useEffect(() => {
    loadContacts(1);
  }, [statusFilter, debouncedSearch]);

  const resetContactForm = () => {
    contactFormik.resetForm({ values: emptyContactForm });
    setEditingContactId(null);
    setContactModalOpen(false);
  };

  const openCreateContact = () => {
    contactFormik.resetForm({ values: emptyContactForm });
    setEditingContactId(null);
    setContactModalOpen(true);
  };

  const startEditContact = (contact: Contact) => {
    setEditingContactId(contact._id);
    contactFormik.setValues({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      status: contact.status,
      notes: contact.notes || "",
    });
    setContactModalOpen(true);
  };

  const openContactDetails = async (contact: Contact) => {
    setViewContact(contact);
    setContactLogs([]);
    await loadContactLogs(contact._id, 1);
  };

  const openContactActivity = async (contact: Contact) => {
    setActivityContact(contact);
    setContactLogs([]);
    await loadContactLogs(contact._id, 1);
  };

  const deleteContact = async (contactId: string) => {
    if (!window.confirm("Delete this contact?")) return;

    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success("Contact deleted");
      await loadContacts(contactPage);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Could not delete contact");
    }
  };

  const exportCsv = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Company",
      "Status",
      "Notes",
      "Created At",
      "Updated At",
    ];

    const rows = contacts.map((contact) => [
      contact.name,
      contact.email,
      contact.phone,
      contact.company,
      contact.status,
      contact.notes || "",
      contact.createdAt,
      contact.updatedAt,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "contacts.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderActivityPagination = ({
    page,
    totalPages,
    total,
    onPageChange,
  }: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  }) => (
    <div className="mt-4 flex flex-col gap-3 border-t border-black/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-bold text-neutral-500">
        Page {page} of {totalPages} · {total} logs
      </p>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page === 1}
          className="h-10 rounded-md border border-black/10 bg-white px-3 text-xs font-black text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={page === totalPages}
          className="h-10 rounded-md bg-black px-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-40px)]">
      <header className="border-b border-black/10 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
              Contacts Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-500">
              Manage leads, prospects and customers with searchable contact records.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
            {[
              ["Total", counts.total],
              ["Leads", counts.Lead],
              ["Prospects", counts.Prospect],
              ["Customers", counts.Customer],
              ["Customer %", customerRatio],
            ].map(([label, value], index, items) => (
              <div
                key={label}
                className={`rounded-md border border-black/10 bg-neutral-50 px-4 py-3 text-center ${
                  items.length % 2 === 1 && index === items.length - 1
                    ? "col-span-2 xl:col-span-1"
                    : ""
                }`}
              >
                <p className="text-xs font-bold uppercase text-neutral-400">
                  {label}
                </p>
                <p className="mt-1 text-xl font-black text-black">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-3 bg-neutral-50 px-3 pt-3 lg:grid-cols-[1fr_220px_150px_150px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="h-12 w-full rounded-md border border-black/10 bg-white pl-11 pr-4 text-sm font-medium outline-none focus:border-black"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | ContactStatus)
          }
          className="h-12 rounded-md border border-black/10 bg-white px-4 text-sm font-bold outline-none focus:border-black"
        >
          <option value="all">All Statuses</option>
          <option value="Lead">Lead</option>
          <option value="Prospect">Prospect</option>
          <option value="Customer">Customer</option>
        </select>

        <button
          type="button"
          onClick={openCreateContact}
          className="flex h-12 items-center justify-center gap-2 rounded-md bg-black px-4 font-bold text-white hover:bg-neutral-800"
        >
          <Plus size={17} />
          Add
        </button>

        <button
          type="button"
          onClick={exportCsv}
          className="flex h-12 items-center justify-center gap-2 rounded-md border border-black bg-white px-4 font-bold text-black hover:bg-black hover:text-white"
        >
          <Download size={17} />
          CSV
        </button>
      </div>

      <main className="bg-neutral-50 p-3">
        <section>
          {loading ? (
            <div className="grid min-h-[320px] place-items-center rounded-[4px] border border-dashed border-black/10 bg-white">
              <p className="font-semibold text-neutral-500">Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="grid min-h-[320px] place-items-center rounded-[4px] border border-dashed border-black/10 bg-white text-center">
              <div>
                <p className="text-xl font-black">No contacts found</p>
                <p className="mt-2 text-sm text-neutral-500">
                  Add a contact or adjust search and filters.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden border border-black/10 bg-white">
              <div className="hidden grid-cols-[70px_1.2fr_1fr_130px_270px] gap-4 border-b border-black/10 bg-neutral-100 px-4 py-3 text-xs font-black uppercase text-neutral-500 lg:grid">
                <span>No.</span>
                <span>Contact</span>
                <span>Company</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>

              {contacts.map((contact, index) => (
                <div
                  key={contact._id}
                  className="grid gap-4 border-b border-black/10 px-4 py-4 last:border-b-0 lg:grid-cols-[70px_1.2fr_1fr_130px_270px] lg:items-center"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-[4px] bg-black text-white">
                    <span className="text-base font-black">
                      {String(
                        (contactPage - 1) * contactsPerPage + index + 1,
                      ).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black text-black">
                      {contact.name}
                    </h3>
                    <p className="mt-1 flex min-w-0 items-center gap-2 text-sm text-neutral-500">
                      <Mail size={14} className="shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
                      <Phone size={14} />
                      {contact.phone}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-black">{contact.company}</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Updated {new Date(contact.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass[contact.status]}`}
                  >
                    {contact.status}
                  </span>

                  <div className="flex gap-3 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => openContactActivity(contact)}
                      title="View activity"
                      className="flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-black/10 bg-white px-3 text-xs font-black text-black hover:bg-violet-50 hover:text-violet-700"
                    >
                      <History size={17} />
                      <span>Activity</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openContactDetails(contact)}
                      title="View contact"
                      className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white hover:bg-lime-50 hover:text-lime-700"
                    >
                      <Eye size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditContact(contact)}
                      title="Edit contact"
                      className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteContact(contact._id)}
                      title="Delete contact"
                      className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <footer className="mt-3 border border-black/10 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-500">
                  Page {contactPage} of {totalContactPages}
                </p>
                <p className="text-xs text-neutral-400">
                  Showing {contacts.length} of {contactTotal} contacts
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 rounded-full bg-black px-3 py-2">
                <button
                  type="button"
                  onClick={() => loadContacts(Math.max(contactPage - 1, 1))}
                  disabled={contactPage === 1}
                  className="grid h-10 w-10 place-items-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={17} />
                </button>

                <div className="grid h-12 min-w-12 place-items-center rounded-full bg-lime-300 px-4 text-xl font-black text-black">
                  {contactPage}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadContacts(Math.min(contactPage + 1, totalContactPages))
                  }
                  disabled={contactPage === totalContactPages}
                  className="grid h-10 w-10 place-items-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </footer>
        </section>
      </main>

      {viewContact && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-md bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-black px-5 py-4">
              <h3 className="text-xl font-black text-white">Contact Details</h3>
              <button
                type="button"
                onClick={() => setViewContact(null)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/15"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto p-5">
              <div>
                <p className="text-xs font-bold uppercase text-neutral-400">
                  Name
                </p>
                <h2 className="mt-1 break-words text-2xl font-black text-black">
                  {viewContact.name}
                </h2>
              </div>

              {[
                ["Email", viewContact.email],
                ["Phone", viewContact.phone],
                ["Company", viewContact.company],
                ["Status", viewContact.status],
                ["Created", new Date(viewContact.createdAt).toLocaleString()],
                ["Updated", new Date(viewContact.updatedAt).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-black/10 pt-3">
                  <p className="text-xs font-bold uppercase text-neutral-400">
                    {label}
                  </p>
                  <p className="mt-1 break-words font-bold text-black">{value}</p>
                </div>
              ))}

              <div className="border-t border-black/10 pt-3">
                <p className="text-xs font-bold uppercase text-neutral-400">
                  Notes
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-neutral-700">
                  {viewContact.notes || "No notes added."}
                </p>
              </div>

              <div className="border-t border-black/10 pt-3">
                <p className="text-xs font-bold uppercase text-neutral-400">
                  Activity
                </p>

                <div className="mt-3 space-y-3">
                  {contactLogs.length === 0 ? (
                    <p className="text-sm font-medium text-neutral-500">
                      No activity recorded for this contact.
                    </p>
                  ) : (
                    contactLogs.map((log, index) => (
                      <div
                        key={log._id}
                        className="grid grid-cols-[34px_1fr] gap-3 border-b border-black/10 pb-3 last:border-b-0"
                      >
                        <div className="grid h-8 w-8 place-items-center rounded-[4px] bg-black text-xs font-black text-white">
                          {getSerialNumber(contactLogPage, index)}
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-bold ${actionBadgeClass[log.action]}`}
                          >
                            {log.action}
                          </span>
                          <p className="mt-2 break-words text-sm font-bold text-black">
                            {log.message}
                          </p>
                          {renderChangeDetails(log)}
                          <p className="mt-1 break-words text-xs font-semibold text-neutral-500">
                            User: {log.userName} ({log.userEmail})
                          </p>
                          <p className="mt-1 text-xs text-neutral-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {contactLogs.length > 0 &&
                  renderActivityPagination({
                    page: contactLogPage,
                    totalPages: totalContactLogPages,
                    total: contactLogTotal,
                    onPageChange: (page) =>
                      viewContact && loadContactLogs(viewContact._id, page),
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activityContact && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-md bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-black px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate text-xl font-black text-white">
                  Activity Logs
                </h3>
                <p className="truncate text-sm font-semibold text-neutral-300">
                  {activityContact.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActivityContact(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              {contactLogs.length === 0 ? (
                <p className="text-sm font-medium text-neutral-500">
                  No activity recorded for this contact.
                </p>
              ) : (
                <div className="space-y-3">
                  {contactLogs.map((log, index) => (
                    <div
                      key={log._id}
                      className="grid grid-cols-[34px_1fr] gap-3 border-b border-black/10 pb-3 last:border-b-0"
                    >
                      <div className="grid h-8 w-8 place-items-center rounded-[4px] bg-black text-xs font-black text-white">
                        {getSerialNumber(contactLogPage, index)}
                      </div>
                      <div className="min-w-0">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${actionBadgeClass[log.action]}`}
                        >
                          {log.action}
                        </span>
                        <p className="mt-2 break-words text-sm font-bold text-black">
                          {log.message}
                        </p>
                        {renderChangeDetails(log)}
                        <p className="mt-1 break-words text-xs font-semibold text-neutral-500">
                          User: {log.userName} ({log.userEmail})
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {contactLogs.length > 0 &&
                renderActivityPagination({
                  page: contactLogPage,
                  totalPages: totalContactLogPages,
                  total: contactLogTotal,
                  onPageChange: (page) =>
                    activityContact && loadContactLogs(activityContact._id, page),
                })}
            </div>
          </div>
        </div>
      )}

      {contactModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={contactFormik.handleSubmit}
            className="w-full max-w-xl overflow-hidden rounded-[4px] bg-white shadow-lg"
          >
            <div className="flex items-center justify-between bg-lime-300 px-5 py-4">
              <h3 className="text-xl font-black text-black">
                {editingContactId ? "Edit Contact" : "Add Contact"}
              </h3>
              <button
                type="button"
                onClick={resetContactForm}
                className="grid h-10 w-10 place-items-center rounded-full bg-black/30 text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {(["name", "email", "phone", "company"] as const).map((field) => (
                <div key={field}>
                  <input
                    name={field}
                    type={field === "email" ? "email" : "text"}
                    value={contactFormik.values[field]}
                    onChange={contactFormik.handleChange}
                    onBlur={contactFormik.handleBlur}
                    placeholder={
                      field.charAt(0).toUpperCase() + field.slice(1)
                    }
                    className="h-12 w-full rounded-[4px] border border-black/10 bg-neutral-50 px-4 outline-none focus:border-black"
                  />
                  {contactFormik.touched[field] &&
                    contactFormik.errors[field] && (
                      <p className="mt-1 text-sm font-semibold text-red-600">
                        {contactFormik.errors[field]}
                      </p>
                    )}
                </div>
              ))}

              <div>
                <select
                  name="status"
                  value={contactFormik.values.status}
                  onChange={contactFormik.handleChange}
                  onBlur={contactFormik.handleBlur}
                  className="h-12 w-full rounded-[4px] border border-black/10 bg-neutral-50 px-4 font-bold outline-none focus:border-black"
                >
                  <option value="Lead">Lead</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Customer">Customer</option>
                </select>
                {contactFormik.touched.status && contactFormik.errors.status && (
                  <p className="mt-1 text-sm font-semibold text-red-600">
                    {contactFormik.errors.status}
                  </p>
                )}
              </div>

              <div>
                <textarea
                  name="notes"
                  value={contactFormik.values.notes}
                  onChange={contactFormik.handleChange}
                  onBlur={contactFormik.handleBlur}
                  placeholder="Notes"
                  rows={4}
                  className="w-full rounded-[4px] border border-black/10 bg-neutral-50 px-4 py-3 outline-none focus:border-black"
                />
                {contactFormik.touched.notes && contactFormik.errors.notes && (
                  <p className="mt-1 text-sm font-semibold text-red-600">
                    {contactFormik.errors.notes}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetContactForm}
                  className="h-12 rounded-[4px] border border-black px-6 font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-12 items-center justify-center gap-2 rounded-[4px] bg-black px-6 font-bold text-white disabled:opacity-60"
                >
                  <Plus size={18} />
                  {saving ? "Saving..." : editingContactId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Contacts;
