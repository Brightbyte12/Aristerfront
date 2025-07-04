import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

const BadgeManagement = () => {
  const [badges, setBadges] = useState([
    { name: 'NEW', color: '#A27B5C', fontColor: '#FFFDEB' },
    { name: 'SALE', color: '#A27B5C', fontColor: '#FFFDEB' }
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const PREDEFINED_BADGES = [
    { name: 'NEW', color: '#A27B5C', fontColor: '#FFFDEB' },
    { name: 'SALE', color: '#A27B5C', fontColor: '#FFFDEB' }
  ];

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/settings/public`);
        let dbBadges = res.data.badges && res.data.badges.length > 0 ? res.data.badges : [];
        // Ensure predefined badges always exist and are first
        PREDEFINED_BADGES.forEach(predef => {
          if (!dbBadges.some((b: any) => b.name.toLowerCase() === predef.name.toLowerCase())) {
            dbBadges.unshift(predef);
          }
        });
        setBadges(dbBadges);
      } catch (err) {
        setError("Failed to load badges");
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const handleSaveBadges = async () => {
    try {
      setLoading(true);
      setSuccess("");
      setError("");
      await axios.put(`${API_BASE_URL}/settings/hero`, { badges });
      setSuccess("Badges updated successfully.");
    } catch (err) {
      setError("Failed to update badges");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Badge Management</h2>
      <div className="space-y-4 mb-8">
        {badges.map((badge, idx) => {
          const isPredefined = PREDEFINED_BADGES.some(
            predef => predef.name.toLowerCase() === badge.name.toLowerCase()
          );
          return (
            <div key={idx} className="flex items-center gap-2 border p-2 rounded bg-white">
              <input
                type="text"
                value={badge.name}
                onChange={e => {
                  const updated = [...badges];
                  updated[idx].name = e.target.value;
                  setBadges(updated);
                }}
                className="border rounded px-2 py-1 text-sm w-32"
                placeholder="Badge Name"
                disabled={loading || isPredefined}
              />
              <input
                type="color"
                value={badge.color}
                onChange={e => {
                  const updated = [...badges];
                  updated[idx].color = e.target.value;
                  setBadges(updated);
                }}
                className="w-10 h-8 p-0 border-none"
                disabled={loading}
              />
              <input
                type="color"
                value={badge.fontColor}
                onChange={e => {
                  const updated = [...badges];
                  updated[idx].fontColor = e.target.value;
                  setBadges(updated);
                }}
                className="w-10 h-8 p-0 border-none"
                disabled={loading}
              />
              {isPredefined ? (
                <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold">Default</span>
              ) : (
                <button
                  type="button"
                  className="ml-2 text-red-600 hover:text-red-800 text-xs font-bold px-2 py-1 border rounded"
                  onClick={() => setBadges(badges.filter((_, i) => i !== idx))}
                  disabled={loading || badges.length <= PREDEFINED_BADGES.length + 1}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
        <button
          type="button"
          className="bg-bronze text-cream px-4 py-1 rounded font-semibold hover:bg-mocha"
          onClick={() => setBadges([...badges, { name: '', color: '#A27B5C', fontColor: '#FFFDEB' }])}
          disabled={loading}
        >
          Add Badge
        </button>
      </div>
      <button
        onClick={handleSaveBadges}
        className="bg-bronze text-cream px-6 py-2 rounded font-semibold mt-4 hover:bg-mocha"
        disabled={loading}
        type="button"
      >
        {loading ? "Saving..." : "Save Badges"}
      </button>
      {(success || error) && (
        <div className={success ? "text-green-600" : "text-red-600"}>
          {success || error}
        </div>
      )}
    </div>
  );
};

export default BadgeManagement; 