import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bell, Globe, Info, Palette } from "lucide-react";
import { useEffect, useState } from "react";

export function SettingsPage() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState(
    () => localStorage.getItem("rahmath_lang") || "English",
  );
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("rahmath_dark_mode") === "true",
  );
  const [notifications, setNotifications] = useState(
    () => localStorage.getItem("rahmath_notifications") !== "false",
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    localStorage.setItem("rahmath_lang", val);
  };

  const handleDarkModeToggle = (val: boolean) => {
    setDarkMode(val);
    localStorage.setItem("rahmath_dark_mode", String(val));
  };

  const handleNotificationsToggle = (val: boolean) => {
    setNotifications(val);
    localStorage.setItem("rahmath_notifications", String(val));
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-lg">
      {/* Back button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/", search: { mode: undefined } })}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          data-ocid="settings.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      {/* Language */}
      <div
        className="bg-card border border-border rounded-xl p-5 mb-4"
        data-ocid="settings.card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-green-600" />
          <h2 className="font-bold text-base text-foreground">Language</h2>
        </div>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          data-ocid="settings.select"
        >
          <option value="English">English</option>
          <option value="Tamil">Tamil</option>
          <option value="Hindi">Hindi</option>
          <option value="Arabic">Arabic</option>
        </select>
      </div>

      {/* Appearance */}
      <div
        className="bg-card border border-border rounded-xl p-5 mb-4"
        data-ocid="settings.card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-green-600" />
          <h2 className="font-bold text-base text-foreground">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">☀️</span>
            <span className="text-sm font-medium text-foreground">
              {darkMode ? "Dark Mode" : "Light Mode"}
            </span>
          </div>
          <Switch
            checked={darkMode}
            onCheckedChange={handleDarkModeToggle}
            data-ocid="settings.switch"
          />
        </div>
      </div>

      {/* Notifications */}
      <div
        className="bg-card border border-border rounded-xl p-5 mb-4"
        data-ocid="settings.card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-green-600" />
          <h2 className="font-bold text-base text-foreground">Notifications</h2>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => handleNotificationsToggle(e.target.checked)}
            className="w-4 h-4 rounded border-input accent-green-600"
            data-ocid="settings.checkbox"
          />
          <span className="text-sm text-foreground">
            Enable order &amp; offer notifications
          </span>
        </label>
      </div>

      {/* About */}
      <div
        className="bg-card border border-border rounded-xl p-5 mb-4"
        data-ocid="settings.card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-green-600" />
          <h2 className="font-bold text-base text-foreground">About</h2>
        </div>
        <p className="text-sm text-foreground font-medium">
          Rahamath Organics v1.0
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Support:{" "}
          <a
            href="mailto:Rahamathorganics@gmail.com"
            className="text-green-600 hover:underline"
          >
            Rahamathorganics@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}
