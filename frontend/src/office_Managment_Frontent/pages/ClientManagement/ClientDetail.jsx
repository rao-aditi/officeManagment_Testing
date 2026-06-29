// import React, { useEffect } from "react";
// import { ModalPortal } from "../../components/Model/ModalPortal";
// import { X, Phone, Mail, MapPin, Building2, Hash, Edit, User, Briefcase, CreditCard, FileText, Calendar, Users, BookOpen, Globe, Award, Fingerprint, ClipboardList } from "lucide-react";
// import Button from "../../components/ui/Button";

// const DetailRow = ({ label, value, icon: Icon }) => (
//   <div className="py-2 border-b border-gray-100">
//     <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
//       {Icon && <Icon size={12} />} {label}
//     </dt>
//     <dd className="text-sm text-gray-900 mt-0.5">{value || "-"}</dd>
//   </div>
// );

// const ClientDetail = ({ client, isOpen, onClose }) => {
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   if (!isOpen || !client) return null;

//   // Helper function to get full name
//   const getFullName = () => {
//     const nameParts = [];
//     if (client.firstName) nameParts.push(client.firstName);
//     if (client.middleName) nameParts.push(client.middleName);
//     if (client.lastName) nameParts.push(client.lastName);
//     return nameParts.length > 0 ? nameParts.join(" ") : null;
//   };

//   // Helper function to get primary display name
//   const getDisplayName = () => {
//     const fullName = getFullName();
//     const businessName = client.businessName || client.companyName || client.name;

//     if (businessName && fullName && businessName !== fullName) {
//       return { primary: businessName, secondary: fullName };
//     }
//     return { primary: businessName || fullName || "-", secondary: null };
//   };

//   const formatServiceType = (type) => type?.replace(/_/g, " ") || "General";
//   const formatEntityType = (type) => {
//     if (type === "INDIVIDUAL") return "Individual";
//     if (type === "COMPANY") return "Company";
//     if (type === "LLP") return "LLP";
//     return type || "-";
//   };

//   const displayName = getDisplayName();

//   return (
//     <ModalPortal>
//       <div className="fixed inset-0 z-50 overflow-y-auto">
//         <div className="flex min-h-full items-center justify-center p-4">
//           <div 
//             className="fixed inset-0 bg-black/60 bg-opacity-50 transition-opacity"
//             onClick={onClose}
//           />

//           <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between z-10">
//               <div className="flex items-center gap-2">
//                 <Building2 size={20} className="text-[#04506B]" />
//                 <h2 className="text-xl font-bold text-gray-900">Client Details</h2>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-1 hover:bg-gray-100 rounded-full transition-colors"
//               >
//                 <X size={20} className="text-gray-500" />
//               </button>
//             </div>

//             <div className="px-8 py-6 space-y-6">
//               {/* Client Name & Status Section */}
//               <div className="flex items-start justify-between gap-4">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <h3 className="text-xl font-bold text-gray-900">
//                       {displayName.primary}
//                     </h3>
//                   </div>
//                   {displayName.secondary && (
//                     <p className="text-sm text-gray-600 mt-1">
//                       <span className="font-medium">Also known as:</span> {client.prefix} {displayName.secondary}
//                     </p>
//                   )}
//                   <div className="flex items-center gap-3 mt-2 flex-wrap">
//                     <p className="text-sm text-gray-500 font-mono">
//                     <span className="font-medium"> Code:</span> {client.clientCode || client.code || "-"}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       <span className="font-medium">Entity:</span>  {formatEntityType(client.entityType)}
//                     </p>
//                     {client.group && (
//                       <p className="text-sm text-gray-500">
//                         <span className="font-medium">Group:</span> {client.group}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <span
//                     className={`px-3 py-1 border rounded-full text-sm font-semibold shrink-0 ${
//                       client.status === "ACTIVE"
//                         ? "bg-green-100 border-green-700 text-green-700"
//                         : "bg-red-100 border-red-700 text-red-700"
//                     }`}
//                   >
//                     {client.status}
//                   </span>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
//                 <div>
//                   <h4 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
//                     <User size={16} className="text-[#04506B]" /> Personal Information
//                   </h4>
//                   <dl>
//                     <DetailRow label="Full Name" value={getFullName()} icon={User} />
//                     <DetailRow label="Father's Name" value={client.fatherName} icon={Users} />
//                     <DetailRow label="Spouse Name" value={client.spouseName} icon={Users} />
//                     <DetailRow label="Gender" value={client.gender} icon={User} />
//                     <DetailRow label="Date of Birth" value={client.dob ? new Date(client.dob).toLocaleDateString() : "-"} icon={Calendar} />
//                     <DetailRow label="Qualification" value={client.qualification} icon={BookOpen} />
//                     <DetailRow label="Occupation" value={client.occupation} icon={Briefcase} />
//                     <DetailRow label="Nationality" value={client.nationality} icon={Globe} />
//                     <DetailRow label="Residential Status" value={client.residentialStatus} />
//                     <DetailRow label="Voter's ID" value={client.votersId} icon={Award} />
//                   </dl>
//                 </div>

//                 {/* Right Column */}
//                 <div>
//                   <h4 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
//                     <Briefcase size={16} className="text-[#04506B]" /> Business Information
//                   </h4>
//                   <dl>
//                     <DetailRow label="Business Name" value={client.businessName} icon={Building2} />
//                     <DetailRow label="Contact Person" value={client.contactPerson} icon={User} />
//                     <DetailRow label="Major Activity" value={formatServiceType(client.majorActivity)} icon={Briefcase} />
//                     <DetailRow label="Nature of Business" value={formatServiceType(client.natureOfBusiness)} />
//                     <DetailRow label="Enterprise Type" value={client.enterpriseType} />
//                     <DetailRow label="Stock Valuation Method" value={client.stockValuationMethod} />
//                     <DetailRow label="Is MSME" value={client.isMSME === "YES" ? "Yes" : "No"} icon={Award} />
//                     <DetailRow label="Is FII/FPI" value={client.isFIIFPI === "YES" ? "Yes" : "No"} />
//                   </dl>
//                 </div>
//               </div>

//               {/* Tax Information Section */}
//               <div>
//                 <h4 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
//                   <FileText size={16} className="text-[#04506B]" /> Tax & Registration Information
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
//                   <dl>
//                     <DetailRow label="PAN" value={client.pan} icon={CreditCard} />
//                     <DetailRow label="TAN" value={client.tan} icon={FileText} />
//                     <DetailRow label="GST Number" value={client.gstNo} icon={CreditCard} />
//                     <DetailRow label="GST Start Date" value={client.gstStartDate ? new Date(client.gstStartDate).toLocaleDateString() : "-"} />
//                     <DetailRow label="GST End Date" value={client.gstEndDate ? new Date(client.gstEndDate).toLocaleDateString() : "-"} />
//                   </dl>
//                   <dl>
//                     <DetailRow label="VAT Registration No" value={client.vatRegNo} />
//                     <DetailRow label="Central Sales Tax No" value={client.centralSalesTaxNo} />
//                     <DetailRow label="Service Tax Reg No" value={client.serviceTaxRegNo} />
//                     <DetailRow label="Other Registration" value={client.otherRegistration} />
//                   </dl>
//                 </div>
//               </div>

//               {/* UIN/Passport Information */}
//               {(client.uinNo || client.mobileLinkedWithUIN || client.nameAsPerUIN) && (
//                 <div>
//                   <h4 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
//                     <Fingerprint size={16} className="text-[#04506B]" /> UIN & Identification
//                   </h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
//                     <dl>
//                       <DetailRow label="UIN Number" value={client.uinNo} icon={Fingerprint} />
//                       <DetailRow label="Name as per UIN" value={client.nameAsPerUIN} />
//                       <DetailRow label="Mobile Linked with UIN" value={client.mobileLinkedWithUIN} icon={Phone} />
//                     </dl>
//                     <dl>
//                       <DetailRow label="Passport Status" value={client.passportStatus} />
//                       <DetailRow label="Passport Number" value={client.passportNumber} />
//                     </dl>
//                   </div>
//                 </div>
//               )}

//               {/* Contact Information */}
//               <div>
//                 <h4 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
//                   <Phone size={16} className="text-[#04506B]" /> Contact Information
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
//                   <dl>
//                     <DetailRow 
//                       label="Phone/Mobile" 
//                       value={client.mobileLinkedWithUIN || client.phone || client.mobile} 
//                       icon={Phone} 
//                     />
//                     <DetailRow label="Email" value={client.email} icon={Mail} />
//                   </dl>
//                 </div>
//               </div>

//               {/* Dates */}
//               <div>
//                 <h4 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
//                   <Calendar size={16} className="text-[#04506B]" /> Important Dates
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2">
//                   <DetailRow 
//                     label="Created" 
//                     value={client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "-"} 
//                     icon={Calendar}
//                   />
//                   <DetailRow 
//                     label="Last Updated" 
//                     value={client.updatedAt ? new Date(client.updatedAt).toLocaleDateString() : "-"} 
//                     icon={Calendar}
//                   />
//                   <DetailRow 
//                     label="Date of Formation" 
//                     value={client.dateOfFormation ? new Date(client.dateOfFormation).toLocaleDateString() : "-"} 
//                   />
//                 </div>
//               </div>

//               {/* Address Records if available */}
//               {client.addresses?.length > 0 && (
//                 <div>
//                   <h4 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
//                     <MapPin size={16} className="text-[#04506B]" /> Additional Addresses
//                   </h4>
//                   <div className="space-y-2 max-h-48 overflow-y-auto">
//                     {client.addresses.map((addr) => (
//                       <div key={addr.id} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
//                         <span className="font-semibold text-sm text-gray-500 uppercase">
//                           {addr.addressType}
//                         </span>
//                         <p className="mt-1">
//                           {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
//                             .filter(Boolean)
//                             .join(", ")}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-end gap-3">
//               <Button variant="outline" onClick={onClose} styleClass="!w-auto">
//                 Close
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </ModalPortal>
//   );
// };

// export default ClientDetail;


import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Phone,
  Mail,
  MapPin,
  Building2,
  Hash,
  User,
  Briefcase,
  CreditCard,
  FileText,
  Calendar,
  Users,
  BookOpen,
  Globe,
  Award,
  Fingerprint,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Link,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card, { CardBody } from "../../components/ui/Card";
import Loader from "@/office_Managment_Frontent/components/Loader/Loader";
import DocumentsSection from "@/office_Managment_Frontent/components/Documents/DocumentsSection";
import { fetchClientById } from "../../store/slice/client/clientSlice";
import { formatDate, formatDateTime } from "../../helpers/commonFunctions";

const DetailRowGrid = ({ label, value, icon: Icon, color = "text-[#04506B]" }) => (
  <div className="py-2.5 border-b border-gray-100 last:border-0">
    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon size={14} className={color} />} {label}
    </dt>
    <dd className="text-sm text-gray-900 mt-0.5 font-medium break-words">{value || "-"}</dd>
  </div>
);

const CollapsibleSection = ({
  title,
  icon: Icon,
  children,
  isOpen = false,
  onToggle,
  className = "",
  badge,
  badgeColor = "bg-blue-100 text-blue-700"
}) => {
  return (
    <Card className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className="text-[#04506B]" />}
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{title}</h4>
          {badge && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </div>
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </Card>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    ACTIVE: {
      color: "bg-emerald-100 border-emerald-600 text-emerald-700",
      icon: CheckCircle,
      label: "Active"
    },
    INACTIVE: {
      color: "bg-red-100 border-red-600 text-red-700",
      icon: AlertCircle,
      label: "Inactive"
    },
  };

  const config = statusConfig[status] || statusConfig.INACTIVE;
  const Icon = config.icon;

  return (
    <span
      className={`px-3 py-1.5 border-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${config.color}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
};

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedClient: client, loading } = useSelector((state) => state.clients);

  const [openSections, setOpenSections] = useState({
    personalInfo: true,
    businessInfo: false,
    taxInfo: false,
    contactInfo: false,
    uinInfo: false,
    assignments: false,
    importantDates: false,
    addresses: false,
    documents: false,
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchClientById(id));
    }
  }, [dispatch, id]);

  const toggleSection = (sectionName) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Client Not Found</h3>
          <p className="text-gray-500 mt-1">The client you're looking for doesn't exist.</p>
          <Button
            variant="primary"
            onClick={() => navigate("/clients")}
            className="mt-4"
          >
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  const getFullName = () => {
    const nameParts = [];
    if (client.prefix) { nameParts.push(client.prefix.trim()); }
    if (client.firstName) { nameParts.push(client.firstName.trim()); }
    if (client.middleName) { nameParts.push(client.middleName.trim()); }
    if (client.lastName) { nameParts.push(client.lastName.trim()); }
    return nameParts.length ? nameParts.join(" ") : null;
  };

  const getDisplayName = () => {
    const fullName = getFullName();
    const businessName = client.businessName || client.companyName || client.name;

    if (businessName && fullName && businessName !== fullName) {
      return { primary: businessName, secondary: fullName };
    }
    return { primary: businessName || fullName || "-", secondary: null };
  };

  const formatServiceType = (type) => type?.replace(/_/g, " ") || "General";

  const formatEntityType = (type) => {
    const types = {
      INDIVIDUAL: "Individual",
      COMPANY: "Company",
      LLP: "LLP",
      PARTNERSHIP: "Partnership",
      PROPRIETORSHIP: "Proprietorship"
    };
    return types[type] || type || "-";
  };

  const displayName = getDisplayName();

  // Count total fields for badge
  const countFields = (obj) => {
    if (!obj) return 0;
    return Object.values(obj).filter(val => val !== null && val !== undefined && val !== "" && val !== "-").length;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-2xl py-4 pl-2 pr-8 bg-gradient-to-r from-[#04364A] via-[#06506B] to-[#022B3A] shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/clients")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                title="Back to Clients"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3 flex-wrap">
                  <Building2 size={24} className="text-cyan-300 flex-shrink-0" />
                  <span>{displayName.primary}</span>
                  <span className="text-sm font-medium text-cyan-100">
                    (GSTIN: {client.gstNo || "-"})
                  </span>
                </h1>

                {displayName.secondary && (
                  <p className="text-white/70 text-sm mt-0.5">
                    <span className="font-medium">Also known as :</span>{" "}
                    {displayName.secondary}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-white/70 text-sm flex items-center gap-1.5">
                    <Hash size={14} className="text-cyan-300" />
                    Code: {client.clientCode || client.code || "-"}
                  </span>
                  <span className="text-white/70 text-sm flex items-center gap-1.5">
                    <User size={14} className="text-cyan-300" />
                    Entity: {formatEntityType(client.entityType)}
                  </span>
                  {client.group && (
                    <span className="text-white/70 text-sm flex items-center gap-1.5">
                      <Users size={14} className="text-cyan-300" />
                      Group: {client.group}
                    </span>
                  )}
                  {client.prefix && (
                    <span className="text-white/70 text-sm flex items-center gap-1.5">
                      <Star size={14} className="text-cyan-300" />
                      Prefix: {client.prefix}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={client.status} />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
      </div>

      <div className="space-y-4">
        {/* Personal Information */}
        <CollapsibleSection
          title="Personal Information"
          icon={User}
          isOpen={openSections.personalInfo}
          onToggle={() => toggleSection('personalInfo')}
          badge={`${countFields({
            fullName: getFullName(),
            fatherName: client.fatherName,
            spouseName: client.spouseName,
            gender: client.gender,
            dob: client.dob,
            qualification: client.qualification,
            occupation: client.occupation,
            nationality: client.nationality,
            residentialStatus: client.residentialStatus,
            votersId: client.votersId,
            passportStatus: client.passportStatus,
            passportNumber: client.passportNumber
          })} fields`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-0">
            <DetailRowGrid label="Full Name" value={getFullName()} icon={User} />
            <DetailRowGrid label="Father's Name" value={client.fatherName} icon={Users} />
            <DetailRowGrid label="Spouse Name" value={client.spouseName} icon={Users} />
            <DetailRowGrid label="Gender" value={client.gender} icon={User} />
            <DetailRowGrid label="Date of Birth" value={formatDate(client.dob)} icon={Calendar} />
            <DetailRowGrid label="Qualification" value={client.qualification} icon={BookOpen} />
            <DetailRowGrid label="Occupation" value={client.occupation} icon={Briefcase} />
            <DetailRowGrid label="Nationality" value={client.nationality} icon={Globe} />
            <DetailRowGrid label="Residential Status" value={client.residentialStatus} />
            <DetailRowGrid label="Voter's ID" value={client.votersId} icon={Award} />
            <DetailRowGrid label="Passport Status" value={client.passportStatus} />
            <DetailRowGrid label="Passport Number" value={client.passportNumber} />
          </div>
        </CollapsibleSection>

        {/* Business Information */}
        <CollapsibleSection
          title="Business Information"
          icon={Briefcase}
          isOpen={openSections.businessInfo}
          onToggle={() => toggleSection('businessInfo')}
          badge={`${countFields({
            businessName: client.businessName,
            companyName: client.companyName,
            contactPerson: client.contactPerson,
            majorActivity: client.majorActivity,
            natureOfBusiness: client.natureOfBusiness,
            enterpriseType: client.enterpriseType,
            stockValuationMethod: client.stockValuationMethod,
            isMSME: client.isMSME,
            msmeRegistrationNo: client.msmeRegistrationNo,
            msmeRegistrationDate: client.msmeRegistrationDate,
            isFIIFPI: client.isFIIFPI,
            dateOfFormation: client.dateOfFormation,
            dateOfCommencementOfBusiness: client.dateOfCommencementOfBusiness
          })} fields`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-0">
            <DetailRowGrid label="Business Name" value={client.businessName} icon={Building2} />
            <DetailRowGrid label="Company Name" value={client.companyName} icon={Building2} />
            <DetailRowGrid label="Contact Person" value={client.contactPerson} icon={User} />
            <DetailRowGrid label="Major Activity" value={formatServiceType(client.majorActivity)} icon={Briefcase} />
            <DetailRowGrid label="Nature of Business" value={formatServiceType(client.natureOfBusiness)} />
            <DetailRowGrid label="Enterprise Type" value={client.enterpriseType} />
            <DetailRowGrid label="Stock Valuation Method" value={client.stockValuationMethod} />
            <DetailRowGrid label="Is MSME" value={client.isMSME === "YES" ? "Yes" : "No"} icon={Award} />
            <DetailRowGrid label="MSME Registration No" value={client.msmeRegistrationNo} />
            <DetailRowGrid label="MSME Registration Date" value={formatDate(client.msmeRegistrationDate)} />
            <DetailRowGrid label="Is FII/FPI" value={client.isFIIFPI === "YES" ? "Yes" : "No"} />
            <DetailRowGrid label="Date of Formation" value={formatDate(client.dateOfFormation)} />
            <DetailRowGrid label="Date of Commencement" value={formatDate(client.dateOfCommencementOfBusiness)} />
          </div>
        </CollapsibleSection>

        {/* documents */}
        <CollapsibleSection
          title="Documents"
          icon={FileText}
          isOpen={openSections.documents}
          onToggle={() => toggleSection("documents")}
        >
          <DocumentsSection clientId={Number(id)} compact />
        </CollapsibleSection>

        {/* Tax & Registration Information */}
        <CollapsibleSection
          title="Tax & Registration"
          icon={FileText}
          isOpen={openSections.taxInfo}
          onToggle={() => toggleSection('taxInfo')}
          badge={`${countFields({
            pan: client.pan,
            tan: client.tan,
            din: client.din,
            gstNo: client.gstNo,
            gstStartDate: client.gstStartDate,
            gstEndDate: client.gstEndDate,
            vatRegNo: client.vatRegNo,
            centralSalesTaxNo: client.centralSalesTaxNo,
            serviceTaxRegNo: client.serviceTaxRegNo,
            otherRegistration: client.otherRegistration,
            sebiRegnNo: client.sebiRegnNo,
            gln: client.gln,
            cin: client.cin
          })} fields`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-0">
            <DetailRowGrid label="PAN" value={client.pan} icon={CreditCard} />
            <DetailRowGrid label="TAN" value={client.tan} icon={FileText} />
            <DetailRowGrid label="DIN" value={client.din} icon={FileText} />
            <DetailRowGrid label="GST Number" value={client.gstNo} icon={CreditCard} />
            <DetailRowGrid label="GST Start Date" value={formatDate(client.gstStartDate)} />
            <DetailRowGrid label="GST End Date" value={formatDate(client.gstEndDate)} />
            <DetailRowGrid label="VAT Registration No" value={client.vatRegNo} />
            <DetailRowGrid label="Central Sales Tax No" value={client.centralSalesTaxNo} />
            <DetailRowGrid label="Service Tax Reg No" value={client.serviceTaxRegNo} />
            <DetailRowGrid label="Other Registration" value={client.otherRegistration} />
            <DetailRowGrid label="SEBI Registration No" value={client.sebiRegnNo} />
            <DetailRowGrid label="GLN" value={client.gln} />
            <DetailRowGrid label="CIN" value={client.cin} />
          </div>
        </CollapsibleSection>

        {/* Contact Information */}
        <CollapsibleSection
          title="Contact Information"
          icon={Phone}
          isOpen={openSections.contactInfo}
          onToggle={() => toggleSection('contactInfo')}
          badge={`${countFields({
            mobile: client.mobileLinkedWithUIN || client.phone || client.mobile,
            email: client.email,
            whatsappNo: client.whatsappNo,
            website: client.website,
            fax: client.fax,
            address: client.address
          })} fields`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-0">
            <DetailRowGrid
              label="Phone/Mobile"
              value={client.mobileLinkedWithUIN || client.phone || client.mobile}
              icon={Phone}
            />
            <DetailRowGrid label="Email" value={client.email} icon={Mail} />
            <DetailRowGrid label="WhatsApp" value={client.whatsappNo || "-"} icon={Phone} />
            <DetailRowGrid label="Website" value={client.website || "-"} icon={Globe} />
            <DetailRowGrid label="Fax" value={client.fax || "-"} />
            <DetailRowGrid label="Address" value={client.address || "-"} icon={MapPin} />
          </div>
        </CollapsibleSection>

        {/* UIN & Identification */}
        {(client.uinNo || client.mobileLinkedWithUIN || client.nameAsPerUIN) && (
          <CollapsibleSection
            title="UIN & Identification"
            icon={Fingerprint}
            isOpen={openSections.uinInfo}
            onToggle={() => toggleSection('uinInfo')}
            badge={`${countFields({
              uinNo: client.uinNo,
              nameAsPerUIN: client.nameAsPerUIN,
              mobileLinkedWithUIN: client.mobileLinkedWithUIN,
              passportStatus: client.passportStatus,
              passportNumber: client.passportNumber
            })} fields`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-0">
              <DetailRowGrid label="UIN Number" value={client.uinNo} icon={Fingerprint} />
              <DetailRowGrid label="Name as per UIN" value={client.nameAsPerUIN} />
              <DetailRowGrid label="Mobile Linked with UIN" value={client.mobileLinkedWithUIN} icon={Phone} />
              <DetailRowGrid label="Passport Status" value={client.passportStatus} />
              <DetailRowGrid label="Passport Number" value={client.passportNumber} />
            </div>
          </CollapsibleSection>
        )}

        {/* Assignment Information */}
        {(client.assignToGST || client.assignToIT || client.assignToPayroll || client.assignToROC || client.assignToTDS) && (
          <CollapsibleSection
            title="Assignments"
            icon={Link}
            isOpen={openSections.assignments}
            onToggle={() => toggleSection('assignments')}
            badge={`${countFields({
              assignToGST: client.assignToGST,
              assignToIT: client.assignToIT,
              assignToPayroll: client.assignToPayroll,
              assignToROC: client.assignToROC,
              assignToTDS: client.assignToTDS
            })} fields`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-0">
              <DetailRowGrid label="Assign to GST" value={client.assignToGST ? "Yes" : "No"} />
              <DetailRowGrid label="Assign to IT" value={client.assignToIT ? "Yes" : "No"} />
              <DetailRowGrid label="Assign to Payroll" value={client.assignToPayroll ? "Yes" : "No"} />
              <DetailRowGrid label="Assign to ROC" value={client.assignToROC ? "Yes" : "No"} />
              <DetailRowGrid label="Assign to TDS" value={client.assignToTDS ? "Yes" : "No"} />
              {client.gstAssignedAt && (
                <DetailRowGrid label="GST Assigned At" value={formatDateTime(client.gstAssignedAt)} />
              )}
              {client.tdsAssignedAt && (
                <DetailRowGrid label="TDS Assigned At" value={formatDateTime(client.tdsAssignedAt)} />
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Important Dates */}
        <CollapsibleSection
          title="Important Dates"
          icon={Calendar}
          isOpen={openSections.importantDates}
          onToggle={() => toggleSection('importantDates')}
          badge={`${countFields({
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
            dateOfDeed: client.dateOfDeed,
            dateOfIncorporation: client.dateOfIncorporation,
            dod: client.dod
          })} fields`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-0">
            <DetailRowGrid
              label="Created"
              value={formatDateTime(client.createdAt)}
              icon={Calendar}
            />
            <DetailRowGrid
              label="Last Updated"
              value={formatDateTime(client.updatedAt)}
              icon={Calendar}
            />
            <DetailRowGrid
              label="Date of Deed"
              value={formatDate(client.dateOfDeed)}
            />
            <DetailRowGrid
              label="Date of Incorporation"
              value={formatDate(client.dateOfIncorporation)}
            />
            <DetailRowGrid
              label="Date of Death"
              value={formatDate(client.dod)}
            />
          </div>
        </CollapsibleSection>

        {/* Addresses Section */}
        {client.addresses?.length > 0 && (
          <CollapsibleSection
            title="Addresses"
            icon={MapPin}
            isOpen={openSections.addresses}
            onToggle={() => toggleSection('addresses')}
            badge={`${client.addresses.length} addresses`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {client.addresses.map((addr, index) => (
                <div key={addr.id || index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-bold text-[#04506B] uppercase bg-cyan-50 px-2 py-0.5 rounded">
                      {addr.addressType || "Address"}
                    </span>
                    {addr.isPrimary && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {addr.country && (
                    <p className="text-sm text-gray-500 mt-1">
                      Country: {addr.country}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-4 pt-3 mb-10 border-t border-gray-200">
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/clients")}>
            <ArrowLeft size={16} className="mr-2" /> Back to List
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;