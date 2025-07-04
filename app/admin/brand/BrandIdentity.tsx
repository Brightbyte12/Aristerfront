"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Upload } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BrandIdentitySettings {
  brandName: string;
  brandLogo: string;
  logoWidth: number;
  brandFont: string;
}

const BrandIdentity = () => {
  const [settings, setSettings] = useState<BrandIdentitySettings>({
    brandName: '',
    brandLogo: '',
    logoWidth: 150,
    brandFont: 'Arial',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch initial settings
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        setSettings({
          brandName: data.brandName || 'ARISTER',
          brandLogo: data.brandLogo || '',
          logoWidth: data.logoWidth || 150,
          brandFont: data.brandFont || 'Arial',
        });
        if (data.brandLogo) {
          setLogoPreview(data.brandLogo);
        }
      } catch (error) {
        console.error('Failed to fetch brand settings', error);
        toast({
          title: 'Error',
          description: 'Could not load brand settings.',
          variant: 'destructive',
        });
      }
    };
    fetchSettings();
  }, [toast]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setSettings(prev => ({ ...prev, brandLogo: '' }));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('brandName', settings.brandName);
    formData.append('logoWidth', settings.logoWidth.toString());
    formData.append('brandFont', settings.brandFont);
    if (logoFile) {
      formData.append('brandLogo', logoFile);
    } else if (settings.brandLogo === '') {
      formData.append('brandLogo', ''); // Explicitly send empty to remove
    }

    try {
      // Note: The backend for logo upload is now complete.
      const { data } = await axios.post('/api/settings/brand', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        setSettings({
          brandName: data.brandName,
          brandLogo: data.brandLogo,
          logoWidth: data.logoWidth,
          brandFont: data.brandFont,
        });
        if (data.brandLogo) {
          setLogoPreview(data.brandLogo);
        } else {
          setLogoPreview(null);
        }
        toast({
          title: 'Success',
          description: 'Brand identity updated successfully.',
        });
      } else {
        throw new Error(data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to update brand identity', error);
      toast({
        title: 'Error',
        description: 'Failed to update brand identity. The logo upload functionality might not be ready.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Identity</CardTitle>
        <CardDescription>
          Manage your brand's name and logo. This will be reflected across the storefront.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="brandName">Brand Name</Label>
          <Input
            id="brandName"
            value={settings.brandName}
            onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                            placeholder="Arister"
            style={{ fontFamily: settings.brandFont }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brandFont">Brand Font</Label>
          <Select
            value={settings.brandFont}
            onValueChange={(value) => setSettings(prev => ({ ...prev, brandFont: value }))}
          >
            <SelectTrigger id="brandFont">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Brand Logo</Label>
          <div className="flex items-center space-x-4">
            <div 
              className="bg-gray-100 border rounded-md flex items-center justify-center overflow-hidden"
              style={{ width: `${settings.logoWidth}px`, height: 'auto' }}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-xs text-gray-500">No Logo</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={logoInputRef}
              onChange={handleLogoChange}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => logoInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </Button>
            {logoPreview && (
              <Button
                variant="destructive"
                onClick={handleRemoveLogo}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <Label htmlFor="logoWidth">Logo Width: {settings.logoWidth}px</Label>
          <Slider
            id="logoWidth"
            min={50}
            max={500}
            step={10}
            value={[settings.logoWidth]}
            onValueChange={(value) => setSettings(prev => ({ ...prev, logoWidth: value[0] }))}
          />
        </div>
        <Button onClick={handleSaveChanges} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BrandIdentity; 