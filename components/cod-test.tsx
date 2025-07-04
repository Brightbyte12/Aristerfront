"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

const CodTest: React.FC = () => {
  const [testData, setTestData] = useState({
    orderValue: 1000,
    pincode: '400001',
    state: 'Maharashtra',
    city: 'Mumbai'
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testCodAvailability = async () => {
    setLoading(true);
    try {
      const mockCartItems = [
        {
          id: 'test-product-1',
          name: 'Test Product',
          price: testData.orderValue,
          quantity: 1,
          category: 'electronics'
        }
      ];

      const mockAddress = {
        postalCode: testData.pincode,
        state: testData.state,
        city: testData.city
      };

      const response = await axios.post('/api/orders/check-cod', {
        cartItems: mockCartItems,
        address: mockAddress
      });

      setResult(response.data);
      toast({
        title: "Test Complete",
        description: response.data.available ? "COD is available" : "COD is not available",
      });
    } catch (error: any) {
      console.error('COD test failed:', error);
      toast({
        title: "Test Failed",
        description: error.response?.data?.message || "Failed to test COD availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>COD Test Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="orderValue">Order Value (₹)</Label>
          <Input
            id="orderValue"
            type="number"
            value={testData.orderValue}
            onChange={(e) => setTestData({ ...testData, orderValue: Number(e.target.value) })}
          />
        </div>
        
        <div>
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            value={testData.pincode}
            onChange={(e) => setTestData({ ...testData, pincode: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={testData.state}
            onChange={(e) => setTestData({ ...testData, state: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={testData.city}
            onChange={(e) => setTestData({ ...testData, city: e.target.value })}
          />
        </div>

        <Button 
          onClick={testCodAvailability} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Testing..." : "Test COD Availability"}
        </Button>

        {result && (
          <div className="mt-4 p-3 border rounded-lg">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <Badge variant={result.available ? "default" : "destructive"}>
                  {result.available ? "Available" : "Not Available"}
                </Badge>
              </div>
              {result.available && (
                <>
                  <div>COD Charge: ₹{result.codCharge}</div>
                  <div>Total Amount: ₹{result.totalAmount}</div>
                </>
              )}
              {!result.available && (
                <div className="text-red-600">Reason: {result.reason}</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodTest; 