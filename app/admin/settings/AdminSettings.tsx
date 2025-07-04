import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

const AdminSettings = () => {
  // Trending Searches State
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [newTrend, setNewTrend] = useState("");
  // Hero Section State
  const [heroBrandName, setHeroBrandName] = useState("");
  const [heroButtonText, setHeroButtonText] = useState("");
  const [heroButtonUrl, setHeroButtonUrl] = useState("");
  const [heroButtonEnabled, setHeroButtonEnabled] = useState(true);
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroBrandNameStyle, setHeroBrandNameStyle] = useState({ fontFamily: 'Georgia, "Times New Roman", serif', color: '#FFFDEB', fontSize: '5xl', visible: true });
  const [heroSubtitleStyle, setHeroSubtitleStyle] = useState({ fontFamily: 'inherit', color: '#FFFDEB', fontSize: 'lg', visible: true });
  const [mensCollectionHeading, setMensCollectionHeading] = useState("Explore Men's Collections");
  const [womensCollectionHeading, setWomensCollectionHeading] = useState({ text: "Explore Women's Collections", fontColor: "#FFFDEB", bgColor: "#A27B5C" });
  const [allCollectionsHeading, setAllCollectionsHeading] = useState({ text: "Explore All Collections", fontColor: "#FFFDEB", bgColor: "#A27B5C" });
  const [newArrivalsHeading, setNewArrivalsHeading] = useState({ text: "Explore New Arrivals", fontColor: "#FFFDEB", bgColor: "#A27B5C" });
  const [badgeColor, setBadgeColor] = useState('#A27B5C');
  const [badgeFontColor, setBadgeFontColor] = useState('#FFFDEB');
  const [badges, setBadges] = useState([
    { name: 'NEW', color: '#A27B5C', fontColor: '#FFFDEB' },
    { name: 'SALE', color: '#A27B5C', fontColor: '#FFFDEB' }
  ]);
  // Loading and feedback
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch current settings
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/settings/public`);
        setTrendingSearches(res.data.trendingSearches || []);
        setHeroBrandName(res.data.heroBrandName || "");
        setHeroButtonText(res.data.heroButton?.text || "");
        setHeroButtonUrl(res.data.heroButton?.url || "");
        setHeroButtonEnabled(res.data.heroButton?.enabled !== false); // default true
        setHeroSubtitle(res.data.heroSubtitle || "");
        setHeroBrandNameStyle(res.data.heroBrandNameStyle || { fontFamily: 'Georgia, "Times New Roman", serif', color: '#FFFDEB', fontSize: '5xl', visible: true });
        setHeroSubtitleStyle(res.data.heroSubtitleStyle || { fontFamily: 'inherit', color: '#FFFDEB', fontSize: 'lg', visible: true });
        setMensCollectionHeading(res.data.mensCollectionHeading || "Explore Men's Collections");
        setWomensCollectionHeading(res.data.womensCollectionHeading || { text: "Explore Women's Collections", fontColor: "#FFFDEB", bgColor: "#A27B5C" });
        setAllCollectionsHeading(res.data.allCollectionsHeading || { text: "Explore All Collections", fontColor: "#FFFDEB", bgColor: "#A27B5C" });
        setNewArrivalsHeading(res.data.newArrivalsHeading || { text: "Explore New Arrivals", fontColor: "#FFFDEB", bgColor: "#A27B5C" });
        setBadgeColor(res.data.badgeColor || '#A27B5C');
        setBadgeFontColor(res.data.badgeFontColor || '#FFFDEB');
        setBadges(res.data.badges && res.data.badges.length > 0 ? res.data.badges : [
          { name: 'NEW', color: '#A27B5C', fontColor: '#FFFDEB' },
          { name: 'SALE', color: '#A27B5C', fontColor: '#FFFDEB' }
        ]);
      } catch (err: any) {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Trending Searches Handlers
  const handleAddTrend = () => {
    const trimmed = newTrend.trim();
    if (!trimmed || trendingSearches.includes(trimmed)) return;
    setTrendingSearches([...trendingSearches, trimmed]);
    setNewTrend("");
  };
  const handleRemoveTrend = (trend: string) => {
    setTrendingSearches(trendingSearches.filter(t => t !== trend));
  };
  const handleSaveTrending = async () => {
    try {
      setLoading(true);
      setSuccess("");
      setError("");
      await axios.put(`${API_BASE_URL}/settings/trending-searches`, { trendingSearches });
      setSuccess("Trending searches updated successfully.");
    } catch (err: any) {
      setError("Failed to update trending searches");
    } finally {
      setLoading(false);
    }
  };

  // Hero Section Handlers
  const handleSaveHero = async () => {
    try {
      setLoading(true);
      setSuccess("");
      setError("");
      await axios.put(`${API_BASE_URL}/settings/hero`, {
        heroBrandName,
        heroButton: {
          text: heroButtonText,
          url: heroButtonUrl,
          enabled: heroButtonEnabled,
        },
        heroSubtitle,
        heroBrandNameStyle,
        heroSubtitleStyle,
        mensCollectionHeading,
        womensCollectionHeading,
        allCollectionsHeading,
        newArrivalsHeading,
        badgeColor,
        badgeFontColor,
        badges,
      });
      setSuccess("Hero section updated successfully.");
    } catch (err: any) {
      setError("Failed to update hero section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Admin Settings</h2>
      {/* Hero Section Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Hero Section</h3>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Brand Name</label>
          <input
            type="text"
            value={heroBrandName}
            onChange={e => setHeroBrandName(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full"
            disabled={loading}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <div>
              <label className="block text-xs">Font Family</label>
              <input type="text" value={heroBrandNameStyle.fontFamily} onChange={e => setHeroBrandNameStyle(s => ({ ...s, fontFamily: e.target.value }))} className="border rounded px-2 py-1 text-xs" disabled={loading} />
            </div>
            <div>
              <label className="block text-xs">Font Color</label>
              <input type="color" value={heroBrandNameStyle.color} onChange={e => setHeroBrandNameStyle(s => ({ ...s, color: e.target.value }))} className="w-8 h-8 p-0 border-none" disabled={loading} />
            </div>
            <div>
              <label className="block text-xs">Font Size</label>
              <input type="text" value={heroBrandNameStyle.fontSize} onChange={e => setHeroBrandNameStyle(s => ({ ...s, fontSize: e.target.value }))} className="border rounded px-2 py-1 text-xs w-16" disabled={loading} placeholder="e.g. 3rem or 5xl" />
            </div>
            <div className="flex items-center mt-4">
              <input type="checkbox" checked={heroBrandNameStyle.visible} onChange={e => setHeroBrandNameStyle(s => ({ ...s, visible: e.target.checked }))} id="brandname-visible" disabled={loading} />
              <label htmlFor="brandname-visible" className="ml-1 text-xs">Show Brand Name</label>
            </div>
          </div>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Button Text</label>
          <input
            type="text"
            value={heroButtonText}
            onChange={e => setHeroButtonText(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full"
            disabled={loading}
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Button Link (URL)</label>
          <input
            type="text"
            value={heroButtonUrl}
            onChange={e => setHeroButtonUrl(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full"
            disabled={loading}
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Subtitle / Description</label>
          <textarea
            value={heroSubtitle}
            onChange={e => setHeroSubtitle(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full min-h-[60px]"
            disabled={loading}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <div>
              <label className="block text-xs">Font Family</label>
              <input type="text" value={heroSubtitleStyle.fontFamily} onChange={e => setHeroSubtitleStyle(s => ({ ...s, fontFamily: e.target.value }))} className="border rounded px-2 py-1 text-xs" disabled={loading} />
            </div>
            <div>
              <label className="block text-xs">Font Color</label>
              <input type="color" value={heroSubtitleStyle.color} onChange={e => setHeroSubtitleStyle(s => ({ ...s, color: e.target.value }))} className="w-8 h-8 p-0 border-none" disabled={loading} />
            </div>
            <div>
              <label className="block text-xs">Font Size</label>
              <input type="text" value={heroSubtitleStyle.fontSize} onChange={e => setHeroSubtitleStyle(s => ({ ...s, fontSize: e.target.value }))} className="border rounded px-2 py-1 text-xs w-16" disabled={loading} placeholder="e.g. 1.5rem or lg" />
            </div>
            <div className="flex items-center mt-4">
              <input type="checkbox" checked={heroSubtitleStyle.visible} onChange={e => setHeroSubtitleStyle(s => ({ ...s, visible: e.target.checked }))} id="subtitle-visible" disabled={loading} />
              <label htmlFor="subtitle-visible" className="ml-1 text-xs">Show Description</label>
            </div>
          </div>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Men's Collection Heading</label>
          <input
            type="text"
            value={mensCollectionHeading}
            onChange={e => setMensCollectionHeading(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full"
            disabled={loading}
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Women's Collection Heading</label>
          <input
            type="text"
            value={womensCollectionHeading.text}
            onChange={e => setWomensCollectionHeading(s => ({ ...s, text: e.target.value }))}
            className="border rounded px-2 py-1 text-sm w-full"
            disabled={loading}
          />
          <div className="flex gap-4 mt-2">
            <div>
              <label className="block text-xs">Font Color</label>
              <input type="color" value={womensCollectionHeading.fontColor} onChange={e => setWomensCollectionHeading(s => ({ ...s, fontColor: e.target.value }))} className="w-8 h-8 p-0 border-none" disabled={loading} />
            </div>
            <div>
              <label className="block text-xs">Background Color</label>
              <input type="color" value={womensCollectionHeading.bgColor} onChange={e => setWomensCollectionHeading(s => ({ ...s, bgColor: e.target.value }))} className="w-8 h-8 p-0 border-none" disabled={loading} />
            </div>
          </div>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">All Collections Heading</label>
          <input
            type="text"
            value={allCollectionsHeading.text}
            onChange={e => setAllCollectionsHeading(s => ({ ...s, text: e.target.value }))}
            className="border rounded px-2 py-1 text-sm w-full"
            disabled={loading}
          />
          <div className="flex gap-4 mt-2">
            <div>
              <label className="block text-xs">Font Color</label>
              <input type="color" value={allCollectionsHeading.fontColor} onChange={e => setAllCollectionsHeading(s => ({ ...s, fontColor: e.target.value }))} className="w-8 h-8 p-0 border-none" disabled={loading} />
            </div>
            <div>
              <label className="block text-xs">Background Color</label>
              <input type="color" value={allCollectionsHeading.bgColor} onChange={e => setAllCollectionsHeading(s => ({ ...s, bgColor: e.target.value }))} className="w-8 h-8 p-0 border-none" disabled={loading} />
            </div>
          </div>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">New Arrivals Heading</label>
          <input
            type="text"
            value={newArrivalsHeading.text}
            onChange={e => setNewArrivalsHeading(s => ({ ...s, text: e.target.value }))}
            className="border rounded px-2 py-1 text-sm w-full"
            disabled={loading}
          />
          <div className="flex gap-4 mt-2">
            <div>
              <label className="block text-xs">Font Color</label>
              <input type="color" value={newArrivalsHeading.fontColor} onChange={e => setNewArrivalsHeading(s => ({ ...s, fontColor: e.target.value }))} className="w-8 h-8 p-0 border-none" disabled={loading} />
            </div>
            <div>
              <label className="block text-xs">Background Color</label>
              <input type="color" value={newArrivalsHeading.bgColor} onChange={e => setNewArrivalsHeading(s => ({ ...s, bgColor: e.target.value }))} className="w-8 h-8 p-0 border-none" disabled={loading} />
            </div>
          </div>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Badge Color</label>
          <input
            type="color"
            value={badgeColor}
            onChange={e => setBadgeColor(e.target.value)}
            className="w-12 h-8 p-0 border-none"
            disabled={loading}
          />
          <label className="block text-sm font-medium mb-1 mt-2">Badge Font Color</label>
          <input
            type="color"
            value={badgeFontColor}
            onChange={e => setBadgeFontColor(e.target.value)}
            className="w-12 h-8 p-0 border-none"
            disabled={loading}
          />
        </div>
        <div className="mb-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={heroButtonEnabled}
            onChange={e => setHeroButtonEnabled(e.target.checked)}
            id="hero-btn-enabled"
            disabled={loading}
          />
          <label htmlFor="hero-btn-enabled" className="text-sm">Show Button</label>
        </div>
        <button
          onClick={handleSaveHero}
          className="bg-bronze text-cream px-6 py-2 rounded font-semibold mt-2 hover:bg-mocha"
          disabled={loading}
          type="button"
        >
          {loading ? "Saving..." : "Save Hero Section"}
        </button>
      </div>
      {/* Trending Searches Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Trending Searches</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {trendingSearches.map((trend, idx) => (
            <span key={trend} className="inline-flex items-center bg-beige text-darkGreen px-3 py-1 rounded-full text-sm">
              {trend}
              <button
                className="ml-2 text-red-500 hover:text-red-700 font-bold"
                onClick={() => handleRemoveTrend(trend)}
                aria-label={`Remove ${trend}`}
                type="button"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTrend}
            onChange={e => setNewTrend(e.target.value)}
            placeholder="Add new trending search"
            className="border rounded px-2 py-1 text-sm"
            onKeyDown={e => { if (e.key === 'Enter') handleAddTrend(); }}
            disabled={loading}
          />
          <button
            onClick={handleAddTrend}
            className="bg-darkGreen text-cream px-4 py-1 rounded text-sm font-semibold hover:bg-mocha"
            disabled={loading || !newTrend.trim() || trendingSearches.includes(newTrend.trim())}
            type="button"
          >
            Add
          </button>
        </div>
        <button
          onClick={handleSaveTrending}
          className="bg-bronze text-cream px-6 py-2 rounded font-semibold mt-2 hover:bg-mocha"
          disabled={loading}
          type="button"
        >
          {loading ? "Saving..." : "Save Trending Searches"}
        </button>
      </div>
      {(success || error) && (
        <div className={success ? "text-green-600" : "text-red-600"}>
          {success || error}
        </div>
      )}
    </div>
  );
};

export default AdminSettings; 