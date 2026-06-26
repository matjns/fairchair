import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChairIcon } from '@/components/icons/ChairIcon';
import { 
  Sparkles, ArrowLeft, Users, Plus, Trash2, UserCheck, User, Edit2, Check, X,
  Circle, Disc, Target, Star, Heart, Zap, Music, Gamepad2, Bike, Shirt,
  type LucideIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFamilyMembers, FamilyMember } from '@/hooks/useFamilyMembers';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FAVORITE_SEAT_OPTIONS, getFavoriteSeatOptionsForVehicle } from '@/data/vehicleRows';

const AVATAR_COLORS = [
  { name: 'primary', class: 'bg-primary', label: 'Blue' },
  { name: 'accent', class: 'bg-accent', label: 'Yellow' },
  { name: 'success', class: 'bg-success', label: 'Green' },
  { name: 'warning', class: 'bg-warning', label: 'Orange' },
  { name: 'destructive', class: 'bg-destructive', label: 'Red' },
];

const AVATAR_ICONS: { name: string; icon: LucideIcon; label: string }[] = [
  { name: 'user', icon: User, label: 'Person' },
  { name: 'circle', icon: Circle, label: 'Ball' },
  { name: 'disc', icon: Disc, label: 'Disc' },
  { name: 'target', icon: Target, label: 'Target' },
  { name: 'star', icon: Star, label: 'Star' },
  { name: 'heart', icon: Heart, label: 'Heart' },
  { name: 'zap', icon: Zap, label: 'Lightning' },
  { name: 'music', icon: Music, label: 'Music' },
  { name: 'gamepad', icon: Gamepad2, label: 'Gaming' },
  { name: 'bike', icon: Bike, label: 'Bike' },
  { name: 'shirt', icon: Shirt, label: 'Sports' },
];

const getIconComponent = (iconName: string): LucideIcon => {
  const found = AVATAR_ICONS.find(i => i.name === iconName);
  return found?.icon || User;
};

const FamilyProfiles: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { familyMembers, loading, addFamilyMember, deleteFamilyMember, refetch } = useFamilyMembers();
  
  const [newName, setNewName] = useState('');
  const [newIsParent, setNewIsParent] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editIcon, setEditIcon] = useState('user');
  const [editFavoriteSeat, setEditFavoriteSeat] = useState<string>('');
  const [vehicle, setVehicle] = useState<{ make: string; model: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
      if (!session?.user) {
        navigate('/auth?redirect=/family-profiles');
      } else {
        supabase
          .from('vehicles')
          .select('make, model')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(({ data }) => {
            if (data) setVehicle(data as any);
          });
      }
    };
    checkAuth();
  }, [navigate]);

  const seatOptions = React.useMemo(
    () => getFavoriteSeatOptionsForVehicle(vehicle?.make, vehicle?.model),
    [vehicle]
  );

  const handleAdd = async () => {
    if (!newName.trim()) return;
    
    try {
      await addFamilyMember(newName.trim(), newIsParent);
      setNewName('');
      setNewIsParent(false);
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) return;
    
    try {
      await deleteFamilyMember(id);
    } catch (err) {
      console.error('Failed to delete member:', err);
    }
  };

  const startEditing = (member: FamilyMember) => {
    setEditingId(member.id);
    setEditName(member.name);
    setEditColor(member.avatar_color);
    setEditIcon(member.avatar_icon || 'user');
    setEditFavoriteSeat(member.favorite_seat || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
    setEditColor('');
    setEditIcon('user');
    setEditFavoriteSeat('');
  };

  const saveEditing = async () => {
    if (!editingId || !editName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('family_members')
        .update({ 
          name: editName.trim(), 
          avatar_color: editColor,
          avatar_icon: editIcon,
          favorite_seat: editFavoriteSeat || null,
        })
        .eq('id', editingId);
      
      if (error) throw error;
      
      await refetch();
      cancelEditing();
    } catch (err) {
      console.error('Failed to update member:', err);
    }
  };

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <ChairIcon className="w-10 h-10 text-primary animate-pulse" filled />
          <span className="text-xl font-bold text-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  const parents = familyMembers.filter(m => m.is_parent);
  const kids = familyMembers.filter(m => !m.is_parent);

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative">
              <ChairIcon className="w-8 h-8 text-primary" filled />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-accent" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Fair<span className="text-primary">Chair</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">Family Profiles</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Manage Your Family</h1>
          <p className="text-muted-foreground">Add, edit, or remove family members.</p>
        </div>

        {/* Parents Section */}
        <div className="card-elevated p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Parents</h2>
          </div>
          
          {parents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No parents added yet.</p>
          ) : (
            <div className="space-y-3">
              {parents.map(member => {
                const IconComponent = getIconComponent(member.avatar_icon || 'user');
                return (
                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  {editingId === member.id ? (
                    <div className="flex-1 space-y-3">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Name"
                        className="max-w-[200px]"
                      />
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Color</p>
                        <div className="flex gap-2">
                          {AVATAR_COLORS.map(color => (
                            <button
                              key={color.name}
                              className={`w-8 h-8 rounded-full ${color.class} ${editColor === color.name ? 'ring-2 ring-offset-2 ring-foreground' : ''}`}
                              onClick={() => setEditColor(color.name)}
                              title={color.label}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Icon</p>
                        <div className="flex flex-wrap gap-2">
                          {AVATAR_ICONS.map(icon => {
                            const Icon = icon.icon;
                            return (
                              <button
                                key={icon.name}
                                className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${editIcon === icon.name ? 'ring-2 ring-offset-2 ring-foreground' : ''}`}
                                onClick={() => setEditIcon(icon.name)}
                                title={icon.label}
                              >
                                <Icon className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEditing}>
                          <Check className="w-4 h-4 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          <X className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-${member.avatar_color} flex items-center justify-center`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">Parent</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => startEditing(member)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(member.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )})}
            </div>
          )}
        </div>

        {/* Kids Section */}
        <div className="card-elevated p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Kids</h2>
          </div>
          
          {kids.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No kids added yet.</p>
          ) : (
            <div className="space-y-3">
              {kids.map(member => {
                const IconComponent = getIconComponent(member.avatar_icon || 'user');
                return (
                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  {editingId === member.id ? (
                    <div className="flex-1 space-y-3">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Name"
                        className="max-w-[200px]"
                      />
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Color</p>
                        <div className="flex gap-2">
                          {AVATAR_COLORS.map(color => (
                            <button
                              key={color.name}
                              className={`w-8 h-8 rounded-full ${color.class} ${editColor === color.name ? 'ring-2 ring-offset-2 ring-foreground' : ''}`}
                              onClick={() => setEditColor(color.name)}
                              title={color.label}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Icon</p>
                        <div className="flex flex-wrap gap-2">
                          {AVATAR_ICONS.map(icon => {
                            const Icon = icon.icon;
                            return (
                              <button
                                key={icon.name}
                                className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${editIcon === icon.name ? 'ring-2 ring-offset-2 ring-foreground' : ''}`}
                                onClick={() => setEditIcon(icon.name)}
                                title={icon.label}
                              >
                                <Icon className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Favorite Seat</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setEditFavoriteSeat('')}
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${editFavoriteSeat === '' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}
                          >
                            None
                          </button>
                          {FAVORITE_SEAT_OPTIONS.map(opt => (
                            <button
                              type="button"
                              key={opt.id}
                              onClick={() => setEditFavoriteSeat(opt.id)}
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${editFavoriteSeat === opt.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEditing}>
                          <Check className="w-4 h-4 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          <X className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-${member.avatar_color} flex items-center justify-center`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{member.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">Kid</p>
                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {member.total_chore_points} pts
                            </span>
                            {member.favorite_seat && (
                              <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent-foreground rounded-full">
                                ★ {FAVORITE_SEAT_OPTIONS.find(o => o.id === member.favorite_seat)?.label ?? member.favorite_seat}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => startEditing(member)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(member.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )})}
            </div>
          )}
        </div>

        {/* Add New Member */}
        <div className="card-elevated p-6">
          {isAdding ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Add Family Member</h3>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter name"
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-parent"
                  checked={newIsParent}
                  onCheckedChange={setNewIsParent}
                />
                <Label htmlFor="is-parent">This is a parent</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={!newName.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
                <Button variant="outline" onClick={() => { setIsAdding(false); setNewName(''); setNewIsParent(false); }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Family Member
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyProfiles;
