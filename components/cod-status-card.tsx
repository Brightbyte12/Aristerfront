"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Settings,
  BarChart3,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

interface CodAnalytics {
  totalCodOrders: number;
  totalCodRevenue: number;
  averageCodCharge: number;
  lastUpdated: string;
}

interface CodStatusCardProps {
  onOpenSettings?: () => void;
}

const CodStatusCard: React.FC<CodStatusCardProps> = ({ onOpenSettings }) => {
  const [analytics, setAnalytics] = useState<CodAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCodStatus();
  }, []);

  const fetchCodStatus = async () => {
    try {
      setLoading(true);
      const [settingsResponse, summaryResponse] = await Promise.all([
        axios.get('/api/settings/public'),
        axios.get('/api/settings/cod-summary')
      ]);

      setCodEnabled(settingsResponse.data.cod?.enabled || false);
      setAnalytics(summaryResponse.data.summary?.analytics || null);
    } catch (error) {
      console.error('Failed to fetch COD status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch COD status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCodStatus = async () => {
    try {
      await axios.put('/api/settings/cod', {
        cod: { enabled: !codEnabled }
      });
      setCodEnabled(!codEnabled);
      toast({
        title: "Success",
        description: `COD ${!codEnabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Failed to toggle COD status:', error);
      toast({
        title: "Error",
        description: "Failed to update COD status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            COD Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            COD Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={codEnabled ? "default" : "secondary"}>
              {codEnabled ? "Active" : "Inactive"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleCodStatus}
            >
              {codEnabled ? "Disable" : "Enable"}
            </Button>
            {onOpenSettings && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSettings}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {analytics ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.totalCodOrders.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ₹{analytics.totalCodRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ₹{analytics.averageCodCharge.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Avg Charge</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Last updated: {new Date(analytics.lastUpdated).toLocaleString()}</span>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-4 text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>No COD analytics available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodStatusCard; 