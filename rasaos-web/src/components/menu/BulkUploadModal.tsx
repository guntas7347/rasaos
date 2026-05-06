import React, { useState } from "react";
import { BaseModal } from "../ui/BaseModal";
import toast from "react-hot-toast";
import { callServer } from "../../lib/helpers";
import { localSuccess } from "../ui/ToasterProvider";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuId: string | null;
  onSuccess: () => void;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkUploadModalProps) {
  const [jsonText, setJsonText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jsonText.trim()) {
      toast.error("Please enter JSON data");
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (err) {
      toast.error("Invalid JSON format");
      return;
    }

    setIsLoading(true);

    const response = await callServer(`/menu/bulk`, {
      method: "POST",
      data: parsedData,
    });

    if (response.success) {
      toast.success(response.message || "Success");
      setJsonText("");
      onSuccess();
      onClose();
    }

    setIsLoading(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Add Menu Data (JSON)"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Paste JSON Payload
          </label>
          <textarea
            required
            autoFocus
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='[
  {
    "name": "Starters",
    "order": 1,
    "items": [...]
  }
]'
            rows={10}
            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Paste menu JSON or generate it using AI from a menu image or text.
            <a
              className="ml-1 underline text-blue-600 hover:text-blue-800 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(aiprompt);
                localSuccess("AI prompt copied to clipboard");
              }}
            >
              Click here to copy prompt
            </a>
          </p>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !jsonText.trim()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Upload JSON"
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

const aiprompt = `Convert this restaurant menu into valid JSON for menu import.

The user may provide:
- Plain text menu
- Menu screenshots
- Menu photos
- PDF menu

Rules:
- Return ONLY valid JSON in code block, nothing else
- No markdown
- If menu input is not provided, reply "Please provide menu in text, image, or pdf."
- No explanations
- Follow the exact structure below
- price must be an integer in paisa
- Example:
  ₹299 = 29900
  ₹99 = 9900
- Keep imageUrl empty if unavailable
- Use variants only when multiple sizes/options exist

JSON Structure:

[
  {
    "name": "Category Name",
    "order": 1,
    "imageUrl": "",
    "items": [
      {
        "name": "Item Name",
        "description": "Description",
        "imageUrl": "",
        "variants": [
          {
            "name": "Regular",
            "price": 29900
          }
        ]
      }
    ]
  }
]

Generate JSON from this menu:`;
