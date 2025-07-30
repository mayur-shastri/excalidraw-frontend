// import { useState } from "react";
// import { Textarea } from "./TextArea";
// import CanvasPreviewAI from "./CanvasPreviewAI";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../Dialog/Dialog";
// import IconButton from "../Buttons/IconButton";
// import { Connection, DrawElement } from "../../types";
// import { Wand2 } from "lucide-react";
// import axios from "axios";
// import { toast } from "sonner";

// type AIFlowModalProps = {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   setAiOpen: (aiOpen: boolean) => void;
//   defaultPrompt?: string;
// };

// export default function AIFlowModal({
//   open,
//   onOpenChange,
//   defaultPrompt = "",
// }: AIFlowModalProps) {
//   const [prompt, setPrompt] = useState(defaultPrompt);

//   const [elements, setElements] = useState<DrawElement[]>([]);
//   const [connections, setConnections] = useState<Connection[]>([]);
//   const [loading, setLoading] = useState(false); // ⬅️ NEW

//   const handleGenerate = async () => {
//     const p = prompt.trim();
//     if (!p || loading) return; // prevent duplicate clicks

//     setLoading(true);
//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_MCP_BACKEND_URL}/diagram/generate`,
//         { userPrompt: p }
//       );

//       if (res.status !== 200) {
//         // force catch to run unified error handling
//         throw new Error(`Unexpected status ${res.status}`);
//       }

//       setElements(res.data?.elements ?? []);
//       setConnections(res.data?.connections ?? []);
//       toast.success("Diagram generated!");
//     } catch (err: any) {
//       const apiMsg =
//         err?.response?.data?.message ||
//         err?.response?.data?.error ||
//         err?.message ||
//         "Failed to generate diagram. Please try again.";
//       toast.error(apiMsg);
//       // optional: keep the modal open so user can adjust prompt; remove next line if you don't want auto-close
//       // setAiOpen(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="min-h-[650px]">
//         <DialogHeader>
//           <DialogTitle>Generate Diagrams with AI</DialogTitle>
//         </DialogHeader>

//         <div className="flex flex-col gap-4 flex-1 overflow-auto px-5 pb-4">
//           {/* Canvas preview */}
//           <div className="relative border rounded-lg overflow-hidden min-h-[430px]">
//             {/* Loading overlay */}
//             {loading && (
//               <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
//                 <div className="flex items-center gap-2">
//                   <span
//                     className="inline-block h-5 w-5 animate-spin rounded-full border border-current border-t-transparent"
//                     aria-hidden="true"
//                   />
//                   <span className="text-sm">Generating…</span>
//                 </div>
//               </div>
//             )}
//             <CanvasPreviewAI elements={elements} connections={connections} />
//           </div>

//           {/* Prompt box */}
//           <div className="flex flex-col gap-2">
//             <div className="flex">
//               <label htmlFor="ai-prompt" className="text-sm font-medium mx-2">
//                 Prompt
//               </label>
//               <p className="text-xs text-muted-foreground">
//                 Tip: Include actors, steps, and decisions (yes/no). Mention shapes if you want (e.g., “decision as
//                 diamond”).
//               </p>
//             </div>
//             <Textarea
//               id="ai-prompt"
//               placeholder={`Describe the diagram here, and let the magic work..`}
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               disabled={loading} // optional: prevent edits mid-request
//             />
//           </div>
//         </div>

//         <DialogFooter>
//           <IconButton
//             type="button"
//             onClick={() => onOpenChange(false)}
//             className="!text-slate-700 hover:bg-slate-100"
//             aria-label="Cancel generate with AI"
//             disabled={loading}
//           >
//             Cancel
//           </IconButton>

//           <IconButton
//             type="button"
//             onClick={handleGenerate}
//             disabled={!prompt.trim() || loading} // ⬅️ disabled while waiting for response or error
//             aria-busy={loading || undefined}
//             className={[
//               "relative bg-slate-900 !text-white hover:bg-slate-800",
//               "disabled:opacity-40 disabled:cursor-not-allowed",
//               "px-3 py-2 mx-2"
//             ].join(" ")}
//             aria-label="Generate flowchart with AI"
//           >
//             {/* Button content with spinner */}
//             <div className="flex items-center gap-2">
//               {loading ? (
//                 <>
//                   <span
//                     className="inline-block h-4 w-4 animate-spin rounded-full border border-current border-t-transparent"
//                     aria-hidden="true"
//                   />
//                   <span>Generating…</span>
//                 </>
//               ) : (
//                 <>
//                   <Wand2 size={20} />
//                   <span>Generate</span>
//                 </>
//               )}
//             </div>
//           </IconButton>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }


import { useState } from "react";
import { Textarea } from "./TextArea";
import CanvasPreviewAI from "./CanvasPreviewAI";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../Dialog/Dialog";
import IconButton from "../Buttons/IconButton";
import { Connection, DrawElement } from "../../types";
import { Wand2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useCanvasContext } from "../../contexts/CanvasContext/CanvasContext";

type AIFlowModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setAiOpen: (aiOpen: boolean) => void;
  defaultPrompt?: string;

  /** ⬅️ NEW: callback you can implement to insert into your editable canvas */
  onInsert?: (payload: { elements: DrawElement[]; connections: Connection[] }) => void;
};

export default function AIFlowModal({
  open,
  onOpenChange,
  defaultPrompt = "",
  onInsert,
  setAiOpen
}: AIFlowModalProps) {
  const [prompt, setPrompt] = useState(defaultPrompt);

  const [elements, setElements] = useState<DrawElement[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);

  const canvasContextProvider = useCanvasContext();
  const setCanvasElements = canvasContextProvider.setElements;
  const setCanvasConnections = canvasContextProvider.setConnections;

  const handleGenerate = async () => {
    const p = prompt.trim();
    if (!p || loading) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_MCP_BACKEND_URL}/diagram/generate`,
        { userPrompt: p }
      );

      if (res.status !== 200) {
        throw new Error(`Unexpected status ${res.status}`);
      }

      setElements(res.data?.elements ?? []);
      setConnections(res.data?.connections ?? []);
      toast.success("Diagram generated!");
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to generate diagram. Please try again.";
      toast.error(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (loading) return;
    if (!elements.length && !connections.length) return;
    onInsert?.({ elements, connections });
    setCanvasElements((prev)=>{
      return [
        ...prev,
        ...elements
      ]
    });
    setCanvasConnections((prev)=>{
      return [
        ...prev,
        ...connections
      ]
    });
    setElements([]);
    setConnections([]);
    setPrompt(defaultPrompt);
    setAiOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-h-[650px]">
        <DialogHeader>
          <DialogTitle>Generate Diagrams with AI</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-auto px-5 pb-4">
          {/* Canvas preview */}
          <div className="relative border rounded-lg overflow-hidden min-h=[430px] min-h-[430px]">
            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-5 w-5 animate-spin rounded-full border border-current border-t-transparent"
                    aria-hidden="true"
                  />
                  <span className="text-sm">Generating…</span>
                </div>
              </div>
            )}
            <CanvasPreviewAI elements={elements} connections={connections} />
          </div>

          {/* Prompt box */}
          <div className="flex flex-col gap-2">
            <div className="flex">
              <label htmlFor="ai-prompt" className="text-sm font-medium mx-2">
                Prompt
              </label>
              <p className="text-xs text-muted-foreground">
                Tip: Include actors, steps, and decisions (yes/no). Mention shapes if you want (e.g., “decision as
                diamond”).
              </p>
            </div>
            <Textarea
              id="ai-prompt"
              placeholder={`Describe the diagram here, and let the magic work..`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <IconButton
            type="button"
            onClick={() => onOpenChange(false)}
            className="!text-slate-700 hover:bg-slate-100"
            aria-label="Cancel generate with AI"
            disabled={loading}
          >
            Cancel
          </IconButton>

          <IconButton
            type="button"
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            aria-busy={loading || undefined}
            className={[
              "relative bg-slate-900 !text-white hover:bg-slate-800",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "px-3 py-2 mx-2"
            ].join(" ")}
            aria-label="Generate flowchart with AI"
          >
            <div className="flex items-center gap-2">
              {loading ? (
                <>
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border border-current border-t-transparent"
                    aria-hidden="true"
                  />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  <span>Generate</span>
                </>
              )}
            </div>
          </IconButton>

          {/* ⬅️ NEW: Insert button, visible only once there’s something to insert */}
          {(elements.length > 0 || connections.length > 0) && (
            <IconButton
              type="button"
              onClick={handleInsert}
              disabled={loading}
              className={[
                "!text-white bg-emerald-600 hover:bg-emerald-500",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "px-3 py-2"
              ].join(" ")}
              aria-label="Insert generated diagram into canvas"
            >
              Insert into canvas
            </IconButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
