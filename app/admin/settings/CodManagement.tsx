"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Save, 
  Plus, 
  Trash2, 
  Settings, 
  MapPin, 
  Truck, 
  Clock, 
  BarChart3,
  DollarSign,
  AlertCircle,
  TestTube
} from "lucide-react";
import axios from 'axios';

interface CodSettings {
  enabled: boolean;
  charge: number;
  pricing: {
    type: 'fixed' | 'percentage' | 'tiered' | 'dynamic';
    fixedAmount: number;
    percentage: number;
    minCharge: number;
    maxCharge: number;
    tiers: Array<{
      minAmount: number;
      maxAmount?: number;
      charge: number;
    }>;
    locationBased: {
      enabled: boolean;
      zones: Array<{
        name: string;
        pincodes: string[];
        states: string[];
        cities: string[];
        charge: number;
        minCharge: number;
        maxCharge: number;
      }>;
    };
  };
  courierCharges: {
    enabled: boolean;
    couriers: Array<{
      name: string;
      code: string;
      percentage: number;
      minCharge: number;
      maxCharge: number;
      enabled: boolean;
    }>;
  };
  rules: {
    minOrderValue: number;
    maxOrderValue: number;
    excludedCategories: string[];
    excludedProducts: string[];
    excludedPincodes: string[];
    excludedStates: string[];
    timeRestrictions: {
      enabled: boolean;
      startTime: string;
      endTime: string;
      daysOfWeek: number[];
    };
  };
  analytics: {
    totalCodOrders: number;
    totalCodRevenue: number;
    averageCodCharge: number;
    lastUpdated: string;
  };
}

const CodManagement: React.FC = () => {
  const [settings, setSettings] = useState<CodSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form states for different sections
  const [newTier, setNewTier] = useState({ minAmount: 0, maxAmount: 0, charge: 0 });
  const [newZone, setNewZone] = useState({ 
    name: '', pincodes: '', states: '', cities: '', charge: 0, minCharge: 30, maxCharge: 200 
  });
  const [newCourier, setNewCourier] = useState({ 
    name: '', code: '', percentage: 2.5, minCharge: 30, maxCharge: 200, enabled: true 
  });

  const [onlinePaymentSettings, setOnlinePaymentSettings] = useState<any>(null);
  const [onlinePaymentLoading, setOnlinePaymentLoading] = useState(true);
  const [onlinePaymentSaving, setOnlinePaymentSaving] = useState(false);
  const [onlinePaymentMessage, setOnlinePaymentMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCodSettings();
  }, []);

  useEffect(() => {
    fetchOnlinePaymentSettings();
  }, []);

  const fetchCodSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data.cod);
    } catch (error) {
      console.error('Failed to fetch COD settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch COD settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlinePaymentSettings = async () => {
    try {
      setOnlinePaymentLoading(true);
      const { data } = await axios.get('/api/settings/public');
      setOnlinePaymentSettings(data.onlinePayment);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch online payment settings", variant: "destructive" });
    } finally {
      setOnlinePaymentLoading(false);
    }
  };

  const saveCodSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await axios.put('/api/settings/cod', { cod: settings });
      toast({
        title: "Success",
        description: "COD settings saved successfully",
      });
    } catch (error) {
      console.error('Failed to save COD settings:', error);
      toast({
        title: "Error",
        description: "Failed to save COD settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveOnlinePaymentSettings = async () => {
    if (!onlinePaymentSettings) return;
    setOnlinePaymentSaving(true);
    try {
      await axios.put('/api/orders/online-payment', { onlinePayment: onlinePaymentSettings });
      setOnlinePaymentMessage('Online payment settings saved successfully.');
      setTimeout(() => setOnlinePaymentMessage(null), 3000);
    } catch (error) {
      setOnlinePaymentMessage('Failed to save online payment settings.');
      setTimeout(() => setOnlinePaymentMessage(null), 4000);
    } finally {
      setOnlinePaymentSaving(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    if (!settings) return;
    
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
  };

  const addTier = () => {
    if (!settings || !newTier.minAmount || !newTier.charge) return;
    
    const updatedTiers = [...settings.pricing.tiers, { ...newTier }];
    updateSetting('pricing.tiers', updatedTiers);
    setNewTier({ minAmount: 0, maxAmount: 0, charge: 0 });
  };

  const removeTier = (index: number) => {
    if (!settings) return;
    
    const updatedTiers = settings.pricing.tiers.filter((_, i) => i !== index);
    updateSetting('pricing.tiers', updatedTiers);
  };

  const addZone = () => {
    if (!settings || !newZone.name || !newZone.charge) return;
    
    const zone = {
      ...newZone,
      pincodes: newZone.pincodes.split(',').map(p => p.trim()).filter(p => p),
      states: newZone.states.split(',').map(s => s.trim()).filter(s => s),
      cities: newZone.cities.split(',').map(c => c.trim()).filter(c => c),
    };
    
    const updatedZones = [...settings.pricing.locationBased.zones, zone];
    updateSetting('pricing.locationBased.zones', updatedZones);
    setNewZone({ name: '', pincodes: '', states: '', cities: '', charge: 0, minCharge: 30, maxCharge: 200 });
  };

  const removeZone = (index: number) => {
    if (!settings) return;
    
    const updatedZones = settings.pricing.locationBased.zones.filter((_, i) => i !== index);
    updateSetting('pricing.locationBased.zones', updatedZones);
  };

  const addCourier = () => {
    if (!settings || !newCourier.name || !newCourier.code) return;
    
    const updatedCouriers = [...settings.courierCharges.couriers, { ...newCourier }];
    updateSetting('courierCharges.couriers', updatedCouriers);
    setNewCourier({ name: '', code: '', percentage: 2.5, minCharge: 30, maxCharge: 200, enabled: true });
  };

  const removeCourier = (index: number) => {
    if (!settings) return;
    
    const updatedCouriers = settings.courierCharges.couriers.filter((_, i) => i !== index);
    updateSetting('courierCharges.couriers', updatedCouriers);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading COD settings...</div>;
  }

  if (!settings) {
    return <div className="p-8">Failed to load COD settings</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">COD Management</h2>
          <p className="text-gray-600">Configure Cash on Delivery settings and charges</p>
        </div>
        <Button onClick={saveCodSettings} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="couriers">Couriers</TabsTrigger>
          <TabsTrigger value="rules">Business Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="test">Test Tool</TabsTrigger>
          <TabsTrigger value="online">Online Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cod-enabled">Enable COD</Label>
                  <p className="text-sm text-gray-600">Allow customers to pay on delivery</p>
                </div>
                <Switch
                  id="cod-enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateSetting('enabled', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="legacy-charge">Legacy Fixed Charge (₹)</Label>
                  <Input
                    id="legacy-charge"
                    type="number"
                    value={settings.charge}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      updateSetting('charge', value);
                      updateSetting('pricing.fixedAmount', value);
                    }}
                    placeholder="50"
                  />
                  <p className="text-sm text-gray-600">Used for backward compatibility</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="pricing-type">Pricing Type</Label>
                <Select
                  value={settings.pricing.type}
                  onValueChange={(value) => updateSetting('pricing.type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage of Order</SelectItem>
                    <SelectItem value="tiered">Tiered Pricing</SelectItem>
                    <SelectItem value="dynamic">Dynamic Pricing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.pricing.type === 'fixed' && (
                <div>
                  <Label htmlFor="fixed-amount">Fixed Amount (₹)</Label>
                  <Input
                    id="fixed-amount"
                    type="number"
                    value={settings.pricing.fixedAmount}
                    onChange={(e) => updateSetting('pricing.fixedAmount', Number(e.target.value))}
                  />
                </div>
              )}

              {settings.pricing.type === 'percentage' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="percentage">Percentage (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      step="0.1"
                      value={settings.pricing.percentage}
                      onChange={(e) => updateSetting('pricing.percentage', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="min-charge">Minimum Charge (₹)</Label>
                    <Input
                      id="min-charge"
                      type="number"
                      value={settings.pricing.minCharge}
                      onChange={(e) => updateSetting('pricing.minCharge', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-charge">Maximum Charge (₹)</Label>
                    <Input
                      id="max-charge"
                      type="number"
                      value={settings.pricing.maxCharge}
                      onChange={(e) => updateSetting('pricing.maxCharge', Number(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {settings.pricing.type === 'tiered' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Tiered Pricing</Label>
                    <Button onClick={addTier} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tier
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      placeholder="Min Amount"
                      type="number"
                      value={newTier.minAmount}
                      onChange={(e) => setNewTier({ ...newTier, minAmount: Number(e.target.value) })}
                    />
                    <Input
                      placeholder="Max Amount (optional)"
                      type="number"
                      value={newTier.maxAmount}
                      onChange={(e) => setNewTier({ ...newTier, maxAmount: Number(e.target.value) })}
                    />
                    <Input
                      placeholder="Charge"
                      type="number"
                      value={newTier.charge}
                      onChange={(e) => setNewTier({ ...newTier, charge: Number(e.target.value) })}
                    />
                    <Button onClick={addTier}>Add</Button>
                  </div>

                  <div className="space-y-2">
                    {settings.pricing.tiers.map((tier, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>
                          ₹{tier.minAmount} - {tier.maxAmount ? `₹${tier.maxAmount}` : '∞'}: ₹{tier.charge}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTier(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location-Based Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="location-enabled">Enable Location-Based Pricing</Label>
                  <p className="text-sm text-gray-600">Set different charges for different locations</p>
                </div>
                <Switch
                  id="location-enabled"
                  checked={settings.pricing.locationBased.enabled}
                  onCheckedChange={(checked) => updateSetting('pricing.locationBased.enabled', checked)}
                />
              </div>

              {settings.pricing.locationBased.enabled && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Location Zones</Label>
                    <Button onClick={addZone} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Zone
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Zone Name"
                      value={newZone.name}
                      onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                    />
                    <Input
                      placeholder="Charge (₹)"
                      type="number"
                      value={newZone.charge}
                      onChange={(e) => setNewZone({ ...newZone, charge: Number(e.target.value) })}
                    />
                    <Input
                      placeholder="Pincodes (comma-separated)"
                      value={newZone.pincodes}
                      onChange={(e) => setNewZone({ ...newZone, pincodes: e.target.value })}
                    />
                    <Input
                      placeholder="States (comma-separated)"
                      value={newZone.states}
                      onChange={(e) => setNewZone({ ...newZone, states: e.target.value })}
                    />
                    <Input
                      placeholder="Cities (comma-separated)"
                      value={newZone.cities}
                      onChange={(e) => setNewZone({ ...newZone, cities: e.target.value })}
                    />
                    <Button onClick={addZone}>Add Zone</Button>
                  </div>

                  <div className="space-y-2">
                    {settings.pricing.locationBased.zones.map((zone, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{zone.name}</h4>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeZone(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Charge: ₹{zone.charge}</p>
                          <p>Pincodes: {zone.pincodes.join(', ') || 'None'}</p>
                          <p>States: {zone.states.join(', ') || 'None'}</p>
                          <p>Cities: {zone.cities.join(', ') || 'None'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="couriers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Courier-Specific Charges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="courier-enabled">Enable Courier-Specific Charges</Label>
                  <p className="text-sm text-gray-600">Set different charges for different couriers</p>
                </div>
                <Switch
                  id="courier-enabled"
                  checked={settings.courierCharges.enabled}
                  onCheckedChange={(checked) => updateSetting('courierCharges.enabled', checked)}
                />
              </div>

              {settings.courierCharges.enabled && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Courier Charges</Label>
                    <Button onClick={addCourier} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Courier
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Courier Name"
                      value={newCourier.name}
                      onChange={(e) => setNewCourier({ ...newCourier, name: e.target.value })}
                    />
                    <Input
                      placeholder="Courier Code"
                      value={newCourier.code}
                      onChange={(e) => setNewCourier({ ...newCourier, code: e.target.value })}
                    />
                    <Input
                      placeholder="Percentage (%)"
                      type="number"
                      step="0.1"
                      value={newCourier.percentage}
                      onChange={(e) => setNewCourier({ ...newCourier, percentage: Number(e.target.value) })}
                    />
                    <Input
                      placeholder="Min Charge (₹)"
                      type="number"
                      value={newCourier.minCharge}
                      onChange={(e) => setNewCourier({ ...newCourier, minCharge: Number(e.target.value) })}
                    />
                    <Input
                      placeholder="Max Charge (₹)"
                      type="number"
                      value={newCourier.maxCharge}
                      onChange={(e) => setNewCourier({ ...newCourier, maxCharge: Number(e.target.value) })}
                    />
                    <Button onClick={addCourier}>Add Courier</Button>
                  </div>

                  <div className="space-y-2">
                    {settings.courierCharges.couriers.map((courier, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-semibold">{courier.name}</span>
                          <span className="text-sm text-gray-600 ml-2">({courier.code})</span>
                          <Badge variant={courier.enabled ? "default" : "secondary"} className="ml-2">
                            {courier.enabled ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">{courier.percentage}% (₹{courier.minCharge}-₹{courier.maxCharge})</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCourier(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Business Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-order">Minimum Order Value (₹)</Label>
                  <Input
                    id="min-order"
                    type="number"
                    value={settings.rules.minOrderValue}
                    onChange={(e) => updateSetting('rules.minOrderValue', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="max-order">Maximum Order Value (₹)</Label>
                  <Input
                    id="max-order"
                    type="number"
                    value={settings.rules.maxOrderValue}
                    onChange={(e) => updateSetting('rules.maxOrderValue', Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="excluded-pincodes">Excluded Pincodes</Label>
                <Textarea
                  id="excluded-pincodes"
                  placeholder="Enter pincodes separated by commas"
                  value={settings.rules.excludedPincodes.join(', ')}
                  onChange={(e) => updateSetting('rules.excludedPincodes', e.target.value.split(',').map(p => p.trim()).filter(p => p))}
                />
              </div>

              <div>
                <Label htmlFor="excluded-states">Excluded States</Label>
                <Textarea
                  id="excluded-states"
                  placeholder="Enter states separated by commas"
                  value={settings.rules.excludedStates.join(', ')}
                  onChange={(e) => updateSetting('rules.excludedStates', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="time-restrictions">Time Restrictions</Label>
                    <p className="text-sm text-gray-600">Restrict COD availability to specific times</p>
                  </div>
                  <Switch
                    id="time-restrictions"
                    checked={settings.rules.timeRestrictions.enabled}
                    onCheckedChange={(checked) => updateSetting('rules.timeRestrictions.enabled', checked)}
                  />
                </div>

                {settings.rules.timeRestrictions.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={settings.rules.timeRestrictions.startTime}
                        onChange={(e) => updateSetting('rules.timeRestrictions.startTime', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={settings.rules.timeRestrictions.endTime}
                        onChange={(e) => updateSetting('rules.timeRestrictions.endTime', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                COD Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{settings.analytics.totalCodOrders}</div>
                  <div className="text-sm text-gray-600">Total COD Orders</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₹{settings.analytics.totalCodRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total COD Revenue</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">₹{settings.analytics.averageCodCharge.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Average COD Charge</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Last updated: {new Date(settings.analytics.lastUpdated).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                COD Test Tool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <p className="text-gray-600 mb-4">
                  Test COD availability and charges for different scenarios
                </p>
                <div className="inline-block p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Use this tool to test how COD charges are calculated for different:
                  </p>
                  <ul className="text-sm text-blue-600 mt-2 text-left">
                    <li>• Order values</li>
                    <li>• Locations (pincodes, states, cities)</li>
                    <li>• Product categories</li>
                    <li>• Time restrictions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="online" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Online Payment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {onlinePaymentLoading ? (
                <div className="flex items-center justify-center p-8">Loading...</div>
              ) : onlinePaymentSettings ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="online-enabled">Enable Online Payment</Label>
                      <p className="text-sm text-gray-600">Allow customers to pay online</p>
                    </div>
                    <Switch
                      id="online-enabled"
                      checked={onlinePaymentSettings.enabled}
                      onCheckedChange={checked => setOnlinePaymentSettings((prev: any) => ({ ...prev, enabled: checked }))}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="online-time-restrictions">Time Restrictions</Label>
                        <p className="text-sm text-gray-600">Restrict online payment to specific times</p>
                      </div>
                      <Switch
                        id="online-time-restrictions"
                        checked={onlinePaymentSettings.timeRestrictions?.enabled}
                        onCheckedChange={checked => setOnlinePaymentSettings((prev: any) => ({ ...prev, timeRestrictions: { ...prev.timeRestrictions, enabled: checked } }))}
                      />
                    </div>
                    {onlinePaymentSettings.timeRestrictions?.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="online-start-time">Start Time</Label>
                          <Input
                            id="online-start-time"
                            type="time"
                            value={onlinePaymentSettings.timeRestrictions.startTime}
                            onChange={e => setOnlinePaymentSettings((prev: any) => ({ ...prev, timeRestrictions: { ...prev.timeRestrictions, startTime: e.target.value } }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="online-end-time">End Time</Label>
                          <Input
                            id="online-end-time"
                            type="time"
                            value={onlinePaymentSettings.timeRestrictions.endTime}
                            onChange={e => setOnlinePaymentSettings((prev: any) => ({ ...prev, timeRestrictions: { ...prev.timeRestrictions, endTime: e.target.value } }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="online-days">Days of Week (comma separated, 0=Sun)</Label>
                          <Input
                            id="online-days"
                            value={onlinePaymentSettings.timeRestrictions.daysOfWeek?.join(',') || ''}
                            onChange={e => setOnlinePaymentSettings((prev: any) => ({ ...prev, timeRestrictions: { ...prev.timeRestrictions, daysOfWeek: e.target.value.split(',').map((v: string) => Number(v.trim())).filter((v: number) => !isNaN(v)) } }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <Button onClick={saveOnlinePaymentSettings} disabled={onlinePaymentSaving}>
                    {onlinePaymentSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                  {onlinePaymentMessage && (
                    <div className={`mt-2 text-sm ${onlinePaymentMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{onlinePaymentMessage}</div>
                  )}
                </>
              ) : (
                <div className="p-8">Failed to load online payment settings</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodManagement; 