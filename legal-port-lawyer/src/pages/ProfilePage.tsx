
import React, { useState, useEffect } from "react";
import { ArrowLeft, Scale, Phone, Mail, Plus, Trash2, Save, Edit3, DollarSign, Star, User, Calendar, BookOpen } from "lucide-react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ProfilePage = ({ user, setCurrentPage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lawyerId, setLawyerId] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Predefined categories list
  const predefinedCategories = [
    'Matrimonial',
    'Commercial',
    'Consumer',
    'Child Laws',
    'Civil',
    'Corporate',
    'Labour Law',
    'Property Rights',
    'Cheque Bounce',
    'Documentation',
    'Criminal',
    'Challans'
  ];
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    bio: "",
    experience: 0,
    pricing: {
      audio: 0,
      video: 0,
      chat: 0
    },
    education: [{
      degree: "",
      institution: "",
      year: ""
    }],
    specializations: [],
    selectedCategories: [], // Track selected categories for editing
    rating: 0,
    reviews: 0,
    connections: 0,
    verified: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLawyerId(user.uid);
        fetchLawyerProfile(user.uid);
        fetchCategories();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLawyerProfile = async (uid) => {
    try {
      const lawyerRef = doc(db, 'lawyer_profiles', uid);
      const lawyerDoc = await getDoc(lawyerRef);
      
      if (lawyerDoc.exists()) {
        const data = lawyerDoc.data();
        
        // Fetch specialization names from categories where this lawyer is included
        const specializationNames = [];
        
        try {
          const categoriesRef = collection(db, 'categories');
          const categoriesSnapshot = await getDocs(categoriesRef);
          
          categoriesSnapshot.forEach((categoryDoc) => {
            const categoryData = categoryDoc.data();
            // Check if this lawyer is in the lawyers array for this category
            if (categoryData.lawyers && categoryData.lawyers.includes(uid)) {
              if (categoryData.names) {
                Object.values(categoryData.names).forEach(name => {
                  if (typeof name === 'string' && !specializationNames.includes(name)) {
                    specializationNames.push(name);
                  }
                });
              }
            }
          });
        } catch (error) {
          console.error('Error fetching specializations from categories:', error);
        }

        // Ensure education is always an array
        const educationData = Array.isArray(data.education) && data.education.length > 0 
          ? data.education 
          : [{ degree: "", institution: "", year: "" }];

        setProfileData({
          name: data.name || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          bio: data.bio || "",
          experience: data.experience || 0,
          pricing: {
            audio: data.pricing?.audio || 0,
            video: data.pricing?.video || 0,
            chat: data.pricing?.chat || 0
          },
          education: educationData,
          specializations: specializationNames,
          selectedCategories: specializationNames, // Initialize with current specializations
          rating: data.rating || 0,
          reviews: data.reviews || 0,
          connections: data.connections || 0,
          verified: data.verified || false
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lawyer profile:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleEducationChange = (index, field, value) => {
    setProfileData(prev => ({
      ...prev,
      education: (prev.education || []).map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addEducation = () => {
    setProfileData(prev => ({
      ...prev,
      education: [...(prev.education || []), { degree: "", institution: "", year: "" }]
    }));
  };

  const removeEducation = (index) => {
    const educationArray = profileData.education || [];
    if (educationArray.length > 1) {
      setProfileData(prev => ({
        ...prev,
        education: (prev.education || []).filter((_, i) => i !== index)
      }));
    }
  };

  const handleCategoryToggle = (categoryName) => {
    setProfileData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryName)
        ? prev.selectedCategories.filter(cat => cat !== categoryName)
        : [...prev.selectedCategories, categoryName]
    }));
  };

  

  const updateCategoriesWithLawyer = async (selectedCategories, lawyerId) => {
    try {
      console.log('Updating categories for lawyer:', lawyerId, 'with specializations:', selectedCategories);
      
      // Get all current categories
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      
      // Process all categories
      const updatePromises = [];
      
      for (const categoryDoc of snapshot.docs) {
        const data = categoryDoc.data();
        const categoryNames = Object.values(data.names || {});
        const currentLawyers = data.lawyers || [];
        const hasLawyer = currentLawyers.includes(lawyerId);
        
        // Check if this category should include this lawyer
        const shouldIncludeLawyer = selectedCategories.some(selectedCat => 
          categoryNames.includes(selectedCat)
        );
        
        if (shouldIncludeLawyer && !hasLawyer) {
          // Add lawyer to this category
          console.log('Adding lawyer to category:', categoryDoc.id, categoryNames);
          updatePromises.push(
            updateDoc(doc(db, 'categories', categoryDoc.id), {
              lawyers: [...currentLawyers, lawyerId],
              updatedAt: new Date()
            })
          );
        } else if (!shouldIncludeLawyer && hasLawyer) {
          // Remove lawyer from this category
          console.log('Removing lawyer from category:', categoryDoc.id, categoryNames);
          updatePromises.push(
            updateDoc(doc(db, 'categories', categoryDoc.id), {
              lawyers: currentLawyers.filter(id => id !== lawyerId),
              updatedAt: new Date()
            })
          );
        }
      }
      
      // Execute all updates
      await Promise.all(updatePromises);
      console.log('Categories updated successfully');
      
    } catch (error) {
      console.error('Error updating categories with lawyer:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!lawyerId) return;
    
    setSaving(true);
    try {
      // Update categories with lawyer ID
      await updateCategoriesWithLawyer(profileData.selectedCategories || [], lawyerId);

      const updateData = {
        name: profileData.name || "",
        email: profileData.email || "",
        phoneNumber: profileData.phoneNumber || "",
        bio: profileData.bio || "",
        experience: Number(profileData.experience) || 0,
        pricing: {
          audio: Number(profileData.pricing.audio) || 0,
          video: Number(profileData.pricing.video) || 0,
          chat: Number(profileData.pricing.chat) || 0
        },
        education: (profileData.education || []).filter(edu => 
          edu && 
          edu.degree && 
          edu.degree.trim() && 
          edu.institution && 
          edu.institution.trim()
        ),
        updatedAt: new Date()
      };

      const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);
      
      // Check if document exists, if not create it
      const lawyerDoc = await getDoc(lawyerRef);
      if (lawyerDoc.exists()) {
        await updateDoc(lawyerRef, updateData);
      } else {
        await setDoc(lawyerRef, {
          ...updateData,
          createdAt: new Date(),
          isOnline: false,
          availability: {
            audio: false,
            video: false,
            chat: false
          },
          rating: 0,
          reviews: 0,
          connections: 0,
          verified: false
        });
      }
      
      // Update the specializations in profile data for display
      setProfileData(prev => ({
        ...prev,
        specializations: profileData.selectedCategories || []
      }));
      
      setIsEditing(false);
      alert('Profile updated successfully!');
      
      // Refresh the profile data to ensure it's in sync
      await fetchLawyerProfile(lawyerId);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98] p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-3 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 rounded-2xl transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-[#9A8C98] to-[#C9ADA7] text-white px-6 py-3 rounded-2xl font-medium hover:from-[#C9ADA7] hover:to-[#F2E9E4] hover:text-[#22223B] transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : isEditing ? (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            ) : (
              <>
                <Edit3 className="w-5 h-5" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#C9ADA7] to-[#F2E9E4] rounded-full flex items-center justify-center">
              <Scale className="w-12 h-12 text-[#22223B]" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="text-2xl font-bold text-white bg-white/10 border border-white/20 rounded-xl px-4 py-2 w-full"
                  placeholder="Enter your name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white">{profileData.name}</h2>
              )}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">{profileData.rating}</span>
                  <span className="text-white/70">({profileData.reviews} reviews)</span>
                </div>
                {profileData.verified && (
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    Verified
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#F2E9E4]">{profileData.connections}</div>
              <div className="text-sm text-white/70">Connections</div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <User className="w-6 h-6" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="Enter email"
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-white/10 border border-white/20 rounded-xl">
                  <Mail className="w-5 h-5 text-white/70" />
                  <span className="text-white">{profileData.email}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-white/10 border border-white/20 rounded-xl">
                  <Phone className="w-5 h-5 text-white/70" />
                  <span className="text-white">{profileData.phoneNumber}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Experience (Years)</label>
              {isEditing ? (
                <input
                  type="number"
                  value={profileData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                  min="0"
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-white/10 border border-white/20 rounded-xl">
                  <Calendar className="w-5 h-5 text-white/70" />
                  <span className="text-white">{profileData.experience} years</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-white/70 text-sm font-medium mb-2">Bio</label>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white resize-none"
                placeholder="Tell clients about yourself..."
              />
            ) : (
              <div className="p-4 bg-white/10 border border-white/20 rounded-xl text-white">
                {profileData.bio || "No bio added yet."}
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <DollarSign className="w-6 h-6" />
            Consultation Pricing (₹/minute)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(profileData.pricing).map(([type, price]) => (
              <div key={type} className="text-center">
                <label className="block text-white/70 text-sm font-medium mb-2 capitalize">{type} Call</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => handleInputChange(`pricing.${type}`, e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-xl font-bold"
                    min="0"
                  />
                ) : (
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                    <div className="text-2xl font-bold text-[#F2E9E4]">₹{price}</div>
                    <div className="text-sm text-white/70">per minute</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              Education
            </h3>
            {isEditing && (
              <button
                onClick={addEducation}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl text-white transition-all"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            )}
          </div>
          <div className="space-y-4">
            {(profileData.education || []).map((edu, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Degree</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                      placeholder="e.g., LLB"
                    />
                  ) : (
                    <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-white">
                      {edu.degree || "Not specified"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Institution</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                      placeholder="e.g., Delhi University"
                    />
                  ) : (
                    <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-white">
                      {edu.institution || "Not specified"}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Year</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={edu.year}
                      onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                      placeholder="2020"
                    />
                  ) : (
                    <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-white">
                      {edu.year || "Not specified"}
                    </div>
                  )}
                </div>
                {isEditing && (profileData.education || []).length > 1 && (
                  <button
                    onClick={() => removeEducation(index)}
                    className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-red-400 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Specializations */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <Scale className="w-6 h-6" />
            Specializations
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <p className="text-white/70 text-sm mb-4">Select your areas of specialization:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {predefinedCategories.map((categoryName) => (
                  <label
                    key={categoryName}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={profileData.selectedCategories.includes(categoryName)}
                      onChange={() => handleCategoryToggle(categoryName)}
                      className="w-4 h-4 text-[#C9ADA7] bg-white/10 border-white/20 rounded focus:ring-[#C9ADA7] focus:ring-2"
                    />
                    <span className="text-white text-sm font-medium">{categoryName}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {profileData.specializations.length > 0 ? (
                profileData.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-[#C9ADA7] text-[#22223B] rounded-xl text-sm font-medium"
                  >
                    {spec}
                  </span>
                ))
              ) : (
                <span className="text-white/70">No specializations added yet.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
