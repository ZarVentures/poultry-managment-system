"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Save, Lock, Bell, Palette } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Settings {
  farmName: string
  farmLocation: string
  farmEmail: string
  farmPhone: string
  currency: string
  theme: "light" | "dark"
  notifications: boolean
  emailAlerts: boolean
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    farmName: "Aziz Poultry Farm",
    farmLocation: "Country, Region",
    farmEmail: "info@azizpoultry.com",
    farmPhone: "+1-234-567-8900",
    currency: "USD",
    theme: "light",
    notifications: true,
    emailAlerts: true,
  })

  const [formData, setFormData] = useState(settings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("settings")
    if (saved) {
      const loaded = JSON.parse(saved)
      setSettings(loaded)
      setFormData(loaded)
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("settings", JSON.stringify(formData))
    setSettings(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!mounted) return null

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your farm and application settings</p>
        </div>

        {saved && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <p className="text-green-800 dark:text-green-200 flex items-center gap-2">
                <span className="text-lg">✓</span>
                Settings saved successfully!
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Farm Information</CardTitle>
                <CardDescription>Update your farm details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Farm Name</Label>
                  <Input
                    value={formData.farmName}
                    onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    placeholder="Farm name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.farmLocation}
                    onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.farmEmail}
                    onChange={(e) => setFormData({ ...formData, farmEmail: e.target.value })}
                    placeholder="email@farm.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.farmPhone}
                    onChange={(e) => setFormData({ ...formData, farmPhone: e.target.value })}
                    placeholder="+1-234-567-8900"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} className="w-full">
                  <Save className="mr-2" size={20} />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette size={20} />
                  Display Settings
                </CardTitle>
                <CardDescription>Customize your interface appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={formData.theme}
                    onValueChange={(value: any) => setFormData({ ...formData, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: Theme changes will be applied to your next session
                  </p>
                </div>
                <Button onClick={handleSave} className="w-full">
                  <Save className="mr-2" size={20} />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Manage how you receive alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                    <input
                      type="checkbox"
                      checked={formData.notifications}
                      onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium">In-App Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications within the application</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                    <input
                      type="checkbox"
                      checked={formData.emailAlerts}
                      onChange={(e) => setFormData({ ...formData, emailAlerts: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium">Email Alerts</p>
                      <p className="text-sm text-muted-foreground">Receive email notifications for important events</p>
                    </div>
                  </label>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Low stock alerts and urgent notifications will always be sent regardless of settings
                  </p>
                </div>

                <Button onClick={handleSave} className="w-full">
                  <Save className="mr-2" size={20} />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock size={20} />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex gap-2">
                  <AlertCircle size={20} className="text-yellow-700 dark:text-yellow-200 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    This application uses localStorage for data persistence. For production use, consider implementing a
                    secure backend database.
                  </p>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  Change Password
                </Button>

                <Button variant="outline" className="w-full bg-transparent">
                  Two-Factor Authentication
                </Button>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Data Management</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Export Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
