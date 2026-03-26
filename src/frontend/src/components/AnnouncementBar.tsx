import { X } from "lucide-react";
import { useState } from "react";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-green-600 text-white py-2 px-4 text-center text-sm relative">
      <span>
        🌿 Free delivery on orders above ₹500 | 100% Organic &amp; Natural
        Products
      </span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
        aria-label="Close announcement"
        data-ocid="announcement.close_button"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
