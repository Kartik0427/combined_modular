import React, { useState, useMemo, useEffect } from "react";
import { Filter, X, Search } from "lucide-react";
import { fetchLawyers, Lawyer } from "../services/lawyerService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  submitConsultationRequest,
  validateUserInfo,
  formatPhoneNumber,
  UserInfoFormData,
  ConsultationRequestData,
} from "../services/consultationRequestService";
import { useAuth } from "../context/AuthContext";
import LawyerCard from "./LawyerCard";
import LawyerModal from "./LawyerModal";
import ConsultationModal from "./ConsultationModal";
import FilterSidebar from "./FilterSidebar";

interface Filters {
  maxAudioRate: number;
  maxVideoRate: number;
  maxChatRate: number;
  minRating: number;
  minExperience: number;
  onlineOnly: boolean;
  specializations: string[];
  sortBy:
    | "rating"
    | "experience"
    | "audioRate"
    | "videoRate"
    | "chatRate"
    | "name";
  sortOrder: "asc" | "desc";
}

interface DetailedLawyer extends Lawyer {
  email?: string;
  phoneNumber?: string;
  bio?: string;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  specializationNames?: string[];
}

const LawyerCatalogue: React.FC = () => {
  const { user } = useAuth();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<DetailedLawyer | null>(
    null,
  );
  const [modalLoading, setModalLoading] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [consultationServiceType, setConsultationServiceType] = useState<
    "audio" | "video" | "chat"
  >("video");
  const [consultationLawyer, setConsultationLawyer] = useState<Lawyer | null>(
    null,
  );
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [userInfoForm, setUserInfoForm] = useState<UserInfoFormData>({
    name: "",
    email: "",
    phoneNumber: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState<Filters>({
    maxAudioRate: 40,
    maxVideoRate: 30,
    maxChatRate: 35,
    minRating: 0,
    minExperience: 0,
    onlineOnly: false,
    specializations: [],
    sortBy: "rating",
    sortOrder: "desc",
  });

  useEffect(() => {
    const loadLawyers = async () => {
      try {
        setLoading(true);
        setError(null);

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error("Request timeout - please try again")),
            15000,
          );
        });

        const fetchedLawyers = await Promise.race([
          fetchLawyers(),
          timeoutPromise,
        ]);

        if (fetchedLawyers.length === 0) {
          setError(
            "No lawyers available at the moment. Please try again later.",
          );
        } else {
          setLawyers(fetchedLawyers);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load lawyers";
        setError(errorMessage);
        console.error("Error loading lawyers:", err);

        setTimeout(() => {
          if (lawyers.length === 0) {
            loadLawyers();
          }
        }, 5000);
      } finally {
        setLoading(false);
      }
    };

    loadLawyers();
  }, []);

  const filteredAndSortedLawyers = useMemo(() => {
    if (!lawyers || lawyers.length === 0) return [];

    let filtered = lawyers.filter((lawyer) => {
      if (!lawyer || !lawyer.name) return false;

      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        lawyer.name.toLowerCase().includes(searchLower) ||
        lawyer.specializations.some(
          (spec) => spec && spec.toLowerCase().includes(searchLower),
        );

      if (!matchesSearch) return false;

      const matchesSpecialization =
        filters.specializations.length === 0 ||
        filters.specializations.some((filterSpec) =>
          lawyer.specializations.some(
            (lawyerSpec) =>
              lawyerSpec &&
              lawyerSpec.toLowerCase().includes(filterSpec.toLowerCase()),
          ),
        );

      if (!matchesSpecialization) return false;

      return (
        (lawyer.pricing?.audio || 0) <= filters.maxAudioRate &&
        (lawyer.pricing?.video || 0) <= filters.maxVideoRate &&
        (lawyer.pricing?.chat || 0) <= filters.maxChatRate &&
        (lawyer.rating || 0) >= filters.minRating &&
        (lawyer.experience || 0) >= filters.minExperience &&
        (!filters.onlineOnly || lawyer.isOnline)
      );
    });

    return filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (filters.sortBy) {
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        case "experience":
          aValue = a.experience;
          bValue = b.experience;
          break;
        case "audioRate":
          aValue = a.pricing.audio;
          bValue = b.pricing.audio;
          break;
        case "videoRate":
          aValue = a.pricing.video;
          bValue = b.pricing.video;
          break;
        case "chatRate":
          aValue = a.pricing.chat;
          bValue = b.pricing.chat;
          break;
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        default:
          aValue = a.rating;
          bValue = b.rating;
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [lawyers, filters, searchTerm]);

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const fetchDetailedLawyerData = async (
    lawyerId: string,
  ): Promise<DetailedLawyer | null> => {
    try {
      const lawyerRef = doc(db, "lawyer_profiles", lawyerId);
      const lawyerDoc = await getDoc(lawyerRef);

      if (!lawyerDoc.exists()) {
        throw new Error("Lawyer not found");
      }

      const data = lawyerDoc.data();
      const basicLawyer = lawyers.find((l) => l.id === lawyerId);

      if (!basicLawyer) {
        throw new Error("Lawyer data not found in local state");
      }

      return {
        ...basicLawyer,
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        bio: data.bio || "",
        education:
          Array.isArray(data.education) && data.education.length > 0
            ? data.education
            : [{ degree: "", institution: "", year: "" }],
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        specializationNames: basicLawyer.specializations,
      };
    } catch (error) {
      console.error("Error fetching detailed lawyer data:", error);
      return null;
    }
  };

  // Fixed: Change return type to void and make function non-async for the prop
  const openModal = (lawyer: Lawyer): void => {
    setModalLoading(true);
    setIsModalOpen(true);

    // Move async logic inside but don't return a promise
    fetchDetailedLawyerData(lawyer.id)
      .then((detailedData) => {
        if (detailedData) {
          setSelectedLawyer(detailedData);
        } else {
          setSelectedLawyer({
            ...lawyer,
            specializationNames: lawyer.specializations,
          });
        }
        setModalLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching detailed lawyer data:", error);
        setSelectedLawyer({
          ...lawyer,
          specializationNames: lawyer.specializations,
        });
        setModalLoading(false);
      });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLawyer(null);
  };

  const resetFilters = () => {
    setFilters({
      maxAudioRate: 40,
      maxVideoRate: 30,
      maxChatRate: 35,
      minRating: 0,
      minExperience: 0,
      onlineOnly: false,
      specializations: [],
      sortBy: "rating",
      sortOrder: "desc",
    });
    setSearchTerm("");
  };

  const handleConsultationRequest = (
    lawyer: Lawyer,
    serviceType: "audio" | "video" | "chat",
  ) => {
    if (!user) {
      alert("Please login to request a consultation");
      return;
    }

    setConsultationLawyer(lawyer);
    setConsultationServiceType(serviceType);
    setIsConsultationModalOpen(true);
  };

  const handleUserInfoFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !consultationLawyer) {
      alert("Please login to submit a consultation request");
      return;
    }

    const errors = validateUserInfo(userInfoForm);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setConsultationLoading(true);
    setFormErrors([]);

    try {
      const requestData: ConsultationRequestData = {
        userId: user.uid,
        lawyerId: consultationLawyer.id,
        serviceType: consultationServiceType,
        message: userInfoForm.message,
        pricing: consultationLawyer.pricing[consultationServiceType],
        userInfo: {
          name: userInfoForm.name,
          email: userInfoForm.email,
          phoneNumber: formatPhoneNumber(userInfoForm.phoneNumber),
        },
      };

      const requestId = await submitConsultationRequest(requestData);

      alert(
        "Consultation request submitted successfully! The lawyer will respond shortly.",
      );

      setUserInfoForm({ name: "", email: "", phoneNumber: "", message: "" });
      setIsConsultationModalOpen(false);
      setConsultationLawyer(null);
    } catch (error) {
      console.error("Error submitting consultation request:", error);
      alert("Failed to submit consultation request. Please try again.");
    } finally {
      setConsultationLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserInfoFormData, value: string) => {
    setUserInfoForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  const toggleSpecialization = (specialization: string) => {
    setFilters((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter((s) => s !== specialization)
        : [...prev.specializations, specialization],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-blue via-slate-900 to-dark-blue">
      <div className="max-w-8xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Find Your Perfect <span className="text-gold">Legal Expert</span>
          </h1>
          <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with verified lawyers instantly via chat, call, or video
            consultation
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-gray-300 focus:ring-2 focus:ring-gold focus:border-gold transition-all duration-300 text-lg"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Filters Sidebar */}
          <div className="xl:col-span-1">
            <button
              onClick={() => setShowFilters(true)}
              className="xl:hidden w-full mb-6 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-dark-blue py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-gold/25 hover:shadow-xl hover:scale-105"
            >
              <Filter className="w-5 h-5" />
              Show Filters & Sort
            </button>
            <FilterSidebar
              filters={filters}
              showFilters={showFilters}
              onUpdateFilter={updateFilter}
              onToggleSpecialization={toggleSpecialization}
              onResetFilters={resetFilters}
              onHideFilters={() => setShowFilters(false)}
            />
          </div>

          {/* Lawyers Grid */}
          <div className="xl:col-span-4">
            {loading ? (
              <div className="text-center py-20">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-white/20">
                  <div className="text-gray-400 mb-6">
                    <div className="w-20 h-20 mx-auto opacity-50 animate-spin rounded-full border-4 border-gold border-t-transparent"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Loading lawyers...
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Please wait while we fetch the latest lawyer profiles
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-white/20">
                  <div className="text-red-400 mb-6">
                    <X className="w-20 h-20 mx-auto opacity-50" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Error loading lawyers
                  </h3>
                  <p className="text-gray-300 mb-8 leading-relaxed">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-dark-blue py-3 px-8 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-gold/25 hover:shadow-xl hover:scale-105"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                {filteredAndSortedLawyers.map((lawyer) => (
                  <LawyerCard
                    key={lawyer.id}
                    lawyer={lawyer}
                    onViewProfile={openModal}
                    onConsultationRequest={handleConsultationRequest}
                  />
                ))}
              </div>
            )}

            {/* No Results State */}
            {!loading && !error && filteredAndSortedLawyers.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-white/20">
                  <div className="text-gray-400 mb-6">
                    <Filter className="w-20 h-20 mx-auto opacity-50" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    No lawyers found
                  </h3>
                  <p className="text-gray-300 mb-8 leading-relaxed">
                    Try adjusting your search terms or filters to discover more
                    legal experts
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-dark-blue py-3 px-8 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-gold/25 hover:shadow-xl hover:scale-105"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #EB9601, #F59E0B);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(235, 150, 1, 0.4);
          border: 3px solid white;
          transition: all 0.3s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 20px rgba(235, 150, 1, 0.6);
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #EB9601, #F59E0B);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(235, 150, 1, 0.4);
          transition: all 0.3s ease;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 20px rgba(235, 150, 1, 0.6);
        }

        .slider::-webkit-slider-track {
          background: transparent;
          height: 12px;
          border-radius: 6px;
        }

        .slider::-moz-range-track {
          background: transparent;
          height: 12px;
          border-radius: 6px;
          border: none;
        }

        .slider {
          -webkit-appearance: none;
          appearance: none;
          height: 12px;
          border-radius: 6px;
          outline: none;
          opacity: 0.9;
          transition: opacity 0.3s;
        }

        .slider:hover {
          opacity: 1;
        }

        .slider:active .slider::-webkit-slider-thumb {
          transform: scale(1.3);
          box-shadow: 0 8px 24px rgba(235, 150, 1, 0.8);
        }
        `,
        }}
      />

      {/* Modals */}
      <LawyerModal
        isOpen={isModalOpen}
        selectedLawyer={selectedLawyer}
        modalLoading={modalLoading}
        onClose={closeModal}
        onConsultationRequest={handleConsultationRequest}
      />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        lawyer={consultationLawyer}
        serviceType={consultationServiceType}
        userInfoForm={userInfoForm}
        formErrors={formErrors}
        loading={consultationLoading}
        onClose={() => setIsConsultationModalOpen(false)}
        onSubmit={handleUserInfoFormSubmit}
        onInputChange={handleInputChange}
      />
    </div>
  );
};

export default LawyerCatalogue;
