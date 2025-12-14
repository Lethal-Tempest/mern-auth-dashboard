import React, { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal.jsx";
import Input from "../components/Input.jsx";

import { getMe, updateMe } from "../services/profileService.js";
import { listTasks, createTask, updateTask, deleteTask } from "../services/taskService.js";
import { validateTask } from "../utils/validators.js";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" }
];

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [meError, setMeError] = useState("");

  const [tasks, setTasks] = useState([]);
  const [tasksError, setTasksError] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", status: "todo" });
  const [taskErrors, setTaskErrors] = useState({});
  const [taskSaving, setTaskSaving] = useState(false);

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  async function loadProfile() {
    setMeError("");
    try {
      const data = await getMe();
      // Accept either {user: {...}} or direct user object; backend will decide.
      setMe(data?.user || data);
    } catch (err) {
      setMeError(err?.response?.data?.message || "Failed to load profile.");
    }
  }

  async function loadTasks(next = { search, status }) {
    setTasksError("");
    try {
      setLoadingTasks(true);
      const data = await listTasks(next);
      // Accept either {tasks: []} or direct array.
      setTasks(Array.isArray(data) ? data : (data?.tasks || []));
    } catch (err) {
      setTasksError(err?.response?.data?.message || "Failed to load tasks.");
    } finally {
      setLoadingTasks(false);
    }
  }

  useEffect(() => {
    loadProfile();
    loadTasks({ search: "", status: "all" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredLabel = useMemo(() => STATUS_OPTIONS.find(s => s.value === status)?.label ?? "All", [status]);

  function openCreate() {
    setEditingTask(null);
    setTaskForm({ title: "", description: "", status: "todo" });
    setTaskErrors({});
    setTaskModalOpen(true);
  }

  function openEdit(t) {
    setEditingTask(t);
    setTaskForm({
      title: t?.title || "",
      description: t?.description || "",
      status: t?.status || "todo"
    });
    setTaskErrors({});
    setTaskModalOpen(true);
  }

  async function saveTask(e) {
    e?.preventDefault?.();
    const errs = validateTask(taskForm);
    setTaskErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setTaskSaving(true);
      if (editingTask?._id) {
        await updateTask(editingTask._id, taskForm);
      } else {
        await createTask(taskForm);
      }
      setTaskModalOpen(false);
      await loadTasks({ search, status });
    } catch (err) {
      setTaskErrors({ _server: err?.response?.data?.message || "Failed to save task." });
    } finally {
      setTaskSaving(false);
    }
  }

  async function removeTask(t) {
    const ok = window.confirm("Delete this task?");
    if (!ok) return;
    try {
      await deleteTask(t._id);
      await loadTasks({ search, status });
    } catch (err) {
      setTasksError(err?.response?.data?.message || "Failed to delete task.");
    }
  }

  async function onSearchApply(e) {
    e.preventDefault();
    await loadTasks({ search, status });
  }

  async function onProfileSave(e) {
    e.preventDefault();
    setProfileMsg("");
    try {
      setProfileSaving(true);
      const payload = { name: me?.name || "", email: me?.email || "" };
      const data = await updateMe(payload);
      setMe(data?.user || data || me);
      setProfileMsg("Profile updated.");
    } catch (err) {
      setProfileMsg(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg(""), 2200);
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-white/60">Profile + Tasks (CRUD, search, filter).</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0b1220] hover:bg-white/90 active:scale-[0.99]"
        >
          + New task
        </button>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft lg:col-span-1">
          <div className="mb-4 text-sm font-semibold text-white/80">Profile</div>

          {meError ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {meError}
            </div>
          ) : null}

          <form onSubmit={onProfileSave} className="space-y-4">
            <Input
              label="Name"
              value={me?.name || ""}
              onChange={(e) => setMe((s) => ({ ...(s || {}), name: e.target.value }))}
              placeholder="Your name"
            />
            <Input
              label="Email"
              value={me?.email || ""}
              onChange={(e) => setMe((s) => ({ ...(s || {}), email: e.target.value }))}
              placeholder="you@example.com"
            />

            {profileMsg ? (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
                {profileMsg}
              </div>
            ) : null}

            <button
              disabled={profileSaving}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
            >
              {profileSaving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-white/80">Tasks</div>
              <div className="mt-1 text-xs text-white/55">
                Filter: <span className="text-white/80">{filteredLabel}</span>
              </div>
            </div>

            <form onSubmit={onSearchApply} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title/description..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-400/60 sm:w-72"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-400/60"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#0b1220]">
                    {s.label}
                  </option>
                ))}
              </select>
              <button className="rounded-xl bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-white hover:brightness-110">
                Apply
              </button>
            </form>
          </div>

          {tasksError ? (
            <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {tasksError}
            </div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loadingTasks ? (
                  <tr>
                    <td className="px-4 py-5 text-white/60" colSpan={3}>
                      Loading tasks...
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td className="px-4 py-5 text-white/60" colSpan={3}>
                      No tasks found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => (
                    <tr key={t._id} className="hover:bg-white/5">
                      <td className="px-4 py-4">
                        <div className="font-medium text-white">{t.title}</div>
                        {t.description ? <div className="mt-1 text-xs text-white/55">{t.description}</div> : null}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/75">
                          {t.status || "todo"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openEdit(t)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeTask(t)}
                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-500/15"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Modal
        open={taskModalOpen}
        title={editingTask ? "Edit task" : "Create task"}
        onClose={() => setTaskModalOpen(false)}
      >
        <form onSubmit={saveTask} className="space-y-4">
          <Input
            label="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm((s) => ({ ...s, title: e.target.value }))}
            error={taskErrors.title}
            placeholder="e.g., Finish assignment"
          />

          <label className="block">
            <div className="mb-1 text-sm text-white/70">Description (optional)</div>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm((s) => ({ ...s, description: e.target.value }))}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-blue-400/60"
              placeholder="Add a bit more detail..."
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm text-white/70">Status</div>
            <select
              value={taskForm.status}
              onChange={(e) => setTaskForm((s) => ({ ...s, status: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blue-400/60"
            >
              <option value="todo" className="bg-[#0b1220]">To do</option>
              <option value="in_progress" className="bg-[#0b1220]">In progress</option>
              <option value="done" className="bg-[#0b1220]">Done</option>
            </select>
          </label>

          {taskErrors._server ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {taskErrors._server}
            </div>
          ) : null}

          <button
            disabled={taskSaving}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-white shadow-soft hover:brightness-110 disabled:opacity-60"
          >
            {taskSaving ? "Saving..." : "Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
