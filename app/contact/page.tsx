'use client';

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from "lucide-react"
import { toast } from "sonner"

interface ContactInfo {
  address?: string;
  email?: string;
  phone?: string;
  workingHours?: string;
  additionalInfo?: string;
}

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    newsletter: false
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/contact/info');
        if (!response.ok) throw new Error('Failed to fetch contact information');
        const data = await response.json();
        setContactInfo(data);
      } catch (error) {
        console.error('Error fetching contact info:', error);
        toast.error('Failed to load contact information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/contact/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          phone: formData.phone
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        newsletter: false
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subject: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-beige to-sand">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-darkGreen mb-6">Get in Touch</h1>
          <p className="text-lg text-mocha max-w-2xl mx-auto">
            We'd love to hear from you. Whether you have questions about our products, need styling advice, or want to
            learn more about our cultural heritage, we're here to help.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Methods */}
            <Card className="border-mocha/20">
              <CardHeader>
                <CardTitle className="text-darkGreen flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Reach out to us through any of these channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-darkGreen mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-darkGreen">Visit Our Store</p>
                      <p className="text-sm text-mocha whitespace-pre-line">{contactInfo.address}</p>
                    </div>
                  </div>
                )}

                {contactInfo.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-darkGreen mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-darkGreen">Call Us</p>
                      <p className="text-sm text-mocha whitespace-pre-line">{contactInfo.phone}</p>
                    </div>
                  </div>
                )}

                {contactInfo.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-darkGreen mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-darkGreen">Email Us</p>
                      <p className="text-sm text-mocha whitespace-pre-line">{contactInfo.email}</p>
                    </div>
                  </div>
                )}

                {contactInfo.workingHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-darkGreen mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-darkGreen">Store Hours</p>
                      <p className="text-sm text-mocha whitespace-pre-line">{contactInfo.workingHours}</p>
                    </div>
                  </div>
                )}

                {contactInfo.additionalInfo && (
                  <div className="mt-4 pt-4 border-t border-mocha/20">
                    <p className="text-sm text-mocha whitespace-pre-line">{contactInfo.additionalInfo}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* FAQ Quick Links */}
            <Card className="border-mocha/20">
              <CardHeader>
                <CardTitle className="text-darkGreen">Quick Help</CardTitle>
                <CardDescription>Common questions and quick solutions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-darkGreen">Sizing Guide</h4>
                  <p className="text-sm text-mocha">Find your perfect fit with our detailed sizing charts.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-darkGreen">Shipping & Returns</h4>
                  <p className="text-sm text-mocha">Learn about our shipping options and replacement policy.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-darkGreen">Care Instructions</h4>
                  <p className="text-sm text-mocha">How to care for your handcrafted garments.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-darkGreen">Custom Orders</h4>
                  <p className="text-sm text-mocha">Information about bespoke and custom clothing.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-mocha/20">
              <CardHeader>
                <CardTitle className="text-darkGreen flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        className="border-mocha/30 focus:border-darkGreen"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        className="border-mocha/30 focus:border-darkGreen"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="border-mocha/30 focus:border-darkGreen"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="border-mocha/30 focus:border-darkGreen"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={formData.subject} onValueChange={handleSelectChange} required>
                      <SelectTrigger className="border-mocha/30 focus:border-darkGreen">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="product">Product Question</SelectItem>
                        <SelectItem value="order">Order Support</SelectItem>
                        <SelectItem value="custom">Custom Order</SelectItem>
                        <SelectItem value="wholesale">Wholesale Inquiry</SelectItem>
                        <SelectItem value="press">Press & Media</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      className="min-h-[120px] border-mocha/30 focus:border-darkGreen resize-none"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="newsletter"
                      className="rounded border-mocha/30"
                      checked={formData.newsletter}
                      onChange={(e) => setFormData(prev => ({ ...prev, newsletter: e.target.checked }))}
                    />
                    <Label htmlFor="newsletter" className="text-sm text-mocha">
                      I'd like to receive updates about new collections and special offers
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-darkGreen hover:bg-darkGreen/90 text-cream"
                    disabled={loading}
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        {contactInfo.address && (
          <div className="mt-12">
            <Card className="border-mocha/20">
              <CardHeader>
                <CardTitle className="text-darkGreen">Find Our Store</CardTitle>
                <CardDescription>
                  Visit us at our store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-beige to-sand rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-darkGreen mx-auto mb-4" />
                    <p className="text-darkGreen font-medium">Interactive Map</p>
                    <p className="text-sm text-mocha">{contactInfo.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-mocha/20 text-center">
            <CardContent className="pt-6">
              <Phone className="h-8 w-8 text-darkGreen mx-auto mb-3" />
              <h3 className="font-semibold text-darkGreen mb-2">Phone Support</h3>
              <p className="text-sm text-mocha">Available during store hours</p>
            </CardContent>
          </Card>

          <Card className="border-mocha/20 text-center">
            <CardContent className="pt-6">
              <Mail className="h-8 w-8 text-darkGreen mx-auto mb-3" />
              <h3 className="font-semibold text-darkGreen mb-2">Email Support</h3>
              <p className="text-sm text-mocha">We respond to all emails within 24 hours</p>
            </CardContent>
          </Card>

          <Card className="border-mocha/20 text-center">
            <CardContent className="pt-6">
              <Clock className="h-8 w-8 text-darkGreen mx-auto mb-3" />
              <h3 className="font-semibold text-darkGreen mb-2">Store Hours</h3>
              <p className="text-sm text-mocha">Visit us during our business hours</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
