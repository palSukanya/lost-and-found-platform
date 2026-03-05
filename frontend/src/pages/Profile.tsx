import { useEffect, useRef, useState } from "react";

import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
} from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  User,
  Mail,
  Lock,
  Camera,
  Settings,
} from "lucide-react";

export default function Profile() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [form, setForm] = useState({
    username: "",
    bio: "",
    phone: "",
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
  });

  /* ================= LOAD ================= */

  const loadProfile = async () => {
    const data = await getProfile();

    setUser(data);

    setForm({
      username: data.username || "",
      bio: data.bio || "",
      phone: data.phone || "",
    });

    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* ================= SAVE ================= */

  const saveProfile = async () => {
    await updateProfile(form);
    await loadProfile();
    setEditOpen(false);
  };

  const updatePassword = async () => {
    await changePassword(password);

    setPassword({
      currentPassword: "",
      newPassword: "",
    });

    setPasswordOpen(false);
  };

  /* ================= AVATAR ================= */

  const handleAvatar = (e: any) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      if (typeof reader.result === "string") {
        await uploadAvatar(reader.result);
        await loadProfile();
      }
    };

    reader.readAsDataURL(file);
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-green-500">
        Loading...
      </div>
    );

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-950 p-6">

      <div className="max-w-5xl mx-auto space-y-6">

        {/* ================= HEADER ================= */}

        <Card className="glass-card">

          <CardContent className="flex flex-col md:flex-row gap-6 items-center p-6">

            {/* Avatar */}
            <div className="relative group">

              <img
                src={user.avatar || "/avatar.png"}
                className="w-28 h-28 rounded-full border-4 border-green-400 object-cover"
              />

              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-1 right-1 bg-green-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100"
              >
                <Camera size={16} />
              </button>

              <input
                hidden
                type="file"
                ref={fileRef}
                onChange={handleAvatar}
              />

            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left text-white">

              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User size={18} />
                {user.username}
              </h2>

              <p className="text-green-300 flex items-center gap-2 mt-1">
                <Mail size={14} />
                {user.email}
              </p>

              <p className="text-sm mt-2 text-green-200">
                {user.bio || "No bio added"}
              </p>

            </div>

          </CardContent>

        </Card>

        {/* ================= TABS ================= */}

        <Tabs defaultValue="overview">

          <TabsList className="glass-tabs">

            <TabsTrigger value="overview">
              <User size={14} className="mr-1" />
              Overview
            </TabsTrigger>

            <TabsTrigger value="settings">
              <Settings size={14} className="mr-1" />
              Settings
            </TabsTrigger>

          </TabsList>

          {/* ================= OVERVIEW ================= */}

          <TabsContent value="overview">

            <div className="grid md:grid-cols-2 gap-6 mt-4">

              <Card className="glass-card">

                <CardHeader>
                  <CardTitle>Profile Info</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 text-green-100">

                  <p><b>Username:</b> {user.username}</p>
                  <p><b>Email:</b> {user.email}</p>
                  <p><b>Phone:</b> {user.phone || "N/A"}</p>

                  <Button
                    className="mt-4 bg-green-500 text-black"
                    onClick={() => setEditOpen(true)}
                  >
                    Edit Profile
                  </Button>

                </CardContent>

              </Card>

              <Card className="glass-card">

                <CardHeader>
                  <CardTitle className="flex gap-2 items-center">
                    <Lock size={16} />
                    Security
                  </CardTitle>
                </CardHeader>

                <CardContent>

                  <Button
                    variant="destructive"
                    onClick={() => setPasswordOpen(true)}
                  >
                    Change Password
                  </Button>

                </CardContent>

              </Card>

            </div>

          </TabsContent>

          {/* ================= SETTINGS ================= */}

          <TabsContent value="settings">

            <Card className="glass-card mt-4">

              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>

              <CardContent>

                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>

              </CardContent>

            </Card>

          </TabsContent>

        </Tabs>

      </div>

      {/* ================= EDIT MODAL ================= */}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>

        <DialogContent className="glass-modal">

          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <Input
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
            placeholder="Username"
          />

          <Textarea
            value={form.bio}
            onChange={(e) =>
              setForm({ ...form, bio: e.target.value })
            }
            placeholder="Bio"
          />

          <Input
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            placeholder="Phone"
          />

          <Button
            className="bg-green-500 text-black"
            onClick={saveProfile}
          >
            Save
          </Button>

        </DialogContent>

      </Dialog>

      {/* ================= PASSWORD MODAL ================= */}

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>

        <DialogContent className="glass-modal">

          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <Input
            type="password"
            placeholder="Current Password"
            value={password.currentPassword}
            onChange={(e) =>
              setPassword({
                ...password,
                currentPassword: e.target.value,
              })
            }
          />

          <Input
            type="password"
            placeholder="New Password"
            value={password.newPassword}
            onChange={(e) =>
              setPassword({
                ...password,
                newPassword: e.target.value,
              })
            }
          />

          <Button
            variant="destructive"
            onClick={updatePassword}
          >
            Update
          </Button>

        </DialogContent>

      </Dialog>

    </div>
  );
}
