import React, { useEffect, useRef, useState, useCallback } from "react";
import { MoreVertical, Save as SaveIcon, UserPlus, X } from "lucide-react";
import { useDiagramContext } from "../../../contexts/DiagramContext/DiagramContext";
import { supabase } from "../../../utils/supabaseClient";
import { toast } from "sonner";
import axios from "axios";
import { getItemLocalStorage } from "../../../utils/localStorage";
import GradientButton from "../../Buttons/GradientButton";

const accessLevels = [
  { value: "VIEW", label: "Viewer" },
  { value: "EDIT", label: "Editor" },
];

type ButtonGroupProps = {
    diagramTitle : string | null;
};

const ButtonGroup: React.FC<ButtonGroupProps> = ({diagramTitle}) => {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  // Invite modal state/logic
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [access, setAccess] = useState("VIEW");
  const [sendingInvite, setSendingInvite] = useState(false);

  // Save modal state/logic
  const [showSave, setShowSave] = useState(false);
  const [newTitle, setNewTitle] = useState(diagramTitle);            // <-- CHANGED: single input only
  const [saving, setSaving] = useState(false);

  const { currentDiagramId } = useDiagramContext(); // <-- CHANGED: get title

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((v) => !v);

  // Close on click outside / ESC
  useEffect(() => {
    if (!menuOpen) return;

    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      closeMenu();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Save logic — always passes updatedTitle from the textbox
  const doSave = useCallback(
    async () => {
      try {
        if (!currentDiagramId) return;
        if (!newTitle.trim()) {
          toast.error("Please enter a name for the diagram.");
          return;
        }

        setSaving(true);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session) {
          toast.error(sessionError?.message || "User not authenticated");
          return;
        }

        const accessToken = session.access_token;
        axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        const payload = {
          updatedElements: getItemLocalStorage(`${currentDiagramId}_elements`),
          updatedConnections: getItemLocalStorage(`${currentDiagramId}_connections`),
          updatedTitle: newTitle.trim(),                       // <-- CHANGED: always include
        };

        const response = await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/diagrams/${currentDiagramId}/update`,
          payload
        );

        if (response.status !== 200) {
          toast.error("Failed to save diagram");
        } else {
          toast.success("Diagram saved successfully");
          setShowSave(false);
          setNewTitle("");
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to save diagram");
      } finally {
        setSaving(false);
      }
    },
    [currentDiagramId, newTitle]
  );

  // Invite logic
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingInvite(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast.error(sessionError?.message || "User not authenticated");
        setSendingInvite(false);
        return;
      }
      const accessToken = session.access_token;
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/invitations/invite`, {
        diagramId: currentDiagramId,
        email,
        access,
      });

      toast.success("Invitation sent!");
      setShowInvite(false);
      setEmail("");
      setAccess("VIEW");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send invite");
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className={[
          "inline-flex items-center justify-center",
          "rounded-lg border border-slate-200 bg-white/90 backdrop-blur px-3 py-2 shadow-sm",
          "hover:bg-white hover:shadow transition",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        ].join(" ")}
        title="Actions"
      >
        <MoreVertical className="h-5 w-5" />
        <span className="sr-only">Open actions menu</span>
      </button>

      {/* Dropdown panel */}
      {menuOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Canvas actions"
          className={[
            "absolute right-0 mt-2 w-56 origin-top-right",
            "rounded-lg border border-slate-200 bg-white p-1 shadow-lg",
          ].join(" ")}
        >
          <button
            role="menuitem"
            onClick={() => {
              closeMenu();
              setShowInvite(true);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50"
          >
            <UserPlus className="h-4 w-4" />
            Invite collaborators…
          </button>

          <button
            role="menuitem"
            onClick={() => {
              closeMenu();
              // Pre-fill the title field with the current diagram title
              setNewTitle(diagramTitle ?? "");           // <-- CHANGED: prefill
              setShowSave(true);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50"
          >
            <SaveIcon className="h-4 w-4" />
            Save diagram
          </button>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-700"
              onClick={() => setShowInvite(false)}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4">Invite to Collaborate</h2>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <select
                className="w-full border rounded px-3 py-2"
                value={access}
                onChange={(e) => setAccess(e.target.value)}
                required
              >
                {accessLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              <GradientButton type="submit" className="w-full" disabled={sendingInvite}>
                {sendingInvite ? "Sending..." : "Send Invite"}
              </GradientButton>
            </form>
          </div>
        </div>
      )}

      {/* Save modal (rename inline) */}
      {showSave && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-700"
              onClick={() => {
                setShowSave(false);
                setNewTitle("");
              }}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold mb-3">Save Diagram</h2>
            <label className="block text-sm text-slate-600 mb-2" htmlFor="diagram-title">
              Rename (optional)
            </label>
            <input
              id="diagram-title"
              type="text"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Enter diagram name"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                onClick={() => {
                  setShowSave(false);
                  setNewTitle("");
                }}
              >
                Cancel
              </button>
              <GradientButton
                type="button"
                disabled={saving || !newTitle.trim()}
                onClick={() => void doSave()}
              >
                {saving ? "Saving…" : "Save"}
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonGroup;
