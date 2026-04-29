import { Project } from "ts-morph";
import * as path from "path";


const project = new Project({
  tsConfigFilePath: "tsconfig.app.json",
});

project.addSourceFilesAtPaths("src/**/*.ts");
project.addSourceFilesAtPaths("src/**/*.tsx");

const srcFolder = path.join(process.cwd(), "src");

// A map of old path (relative to src) to new path (relative to src)
const moves: Record<string, string> = {
  // auth folder to pages/auth
  "auth/Login.tsx": "pages/auth/Login.tsx",
  "auth/VendorContect.tsx": "context/VendorContext.tsx",

  // common login to pages/auth
  "components/common/LoginPage.tsx": "pages/auth/LoginPage.tsx",
  "components/common/ValidationLogin/authValidation.ts": "pages/auth/validation/authValidation.ts",
  "components/common/types/authTypes.ts": "types/authTypes.ts",

  // layouts
  "components/vendor/layout/Footer.tsx": "components/layouts/Footer.tsx",
  "components/vendor/layout/Layout.tsx": "components/layouts/Layout.tsx",
  "components/vendor/layout/Navbar.tsx": "components/layouts/Navbar.tsx",
  "components/vendor/layout/Sidebar.tsx": "components/layouts/Sidebar.tsx",
  "components/vendor/layout/VendorScreenDefault.tsx": "components/layouts/VendorScreenDefault.tsx",
  "components/vendor/layout/mainLayout/MainLayout.tsx": "components/layouts/MainLayout.tsx",

  // Page -> pages
  "Page/User/Booking.tsx": "pages/user/Booking.tsx",
  "Page/User/Home.tsx": "pages/user/Home.tsx",
  "Page/User/MyBookings.tsx": "pages/user/MyBookings.tsx",
  "Page/User/Profile.tsx": "pages/user/Profile.tsx",
  "Page/User/VenueDetails.tsx": "pages/user/VenueDetails.tsx",
  "Page/User/VenueList.tsx": "pages/user/VenueList.tsx",
  "Page/User/vendors_Requestform/VendorRegistrationForm.tsx": "pages/user/VendorRegistration/VendorRegistrationForm.tsx",
  "Page/User/vendors_Requestform/ReqComponet/componets/FormSection.tsx": "pages/user/VendorRegistration/components/FormSection.tsx",
  "Page/User/vendors_Requestform/ReqComponet/componets/InputField.tsx": "pages/user/VendorRegistration/components/InputField.tsx",
  "Page/User/vendors_Requestform/ReqComponet/componets/states.ts": "pages/user/VendorRegistration/components/states.ts",
  "Page/User/vendors_Requestform/ReqComponet/componets/SuccessScreen.tsx": "pages/user/VendorRegistration/components/SuccessScreen.tsx",
  "Page/User/vendors_Requestform/ReqComponet/types/formTypes.ts": "pages/user/VendorRegistration/types/formTypes.ts",
  "Page/User/vendors_Requestform/ReqComponet/types/vendorTypes.ts": "pages/user/VendorRegistration/types/vendorTypes.ts",
  "Page/User/vendors_Requestform/ReqComponet/utils/validate.ts": "pages/user/VendorRegistration/utils/validate.ts",

  // Vendor pages
  "Page/vendor/AddVenue.tsx": "pages/vendor/AddVenue.tsx",
  "Page/vendor/Bookings.tsx": "pages/vendor/Bookings.tsx",
  "Page/vendor/Dashboard.tsx": "pages/vendor/Dashboard.tsx",
  "Page/vendor/EditVenue.tsx": "pages/vendor/EditVenue.tsx",
  "Page/vendor/ManageVenues.tsx": "pages/vendor/ManageVenues.tsx",
  "Page/vendor/Profile.tsx": "pages/vendor/Profile.tsx",

  // Vendor AddVenue
  "Page/vendor/AddVenue/VenueList.tsx": "pages/vendor/AddVenue/VenueList.tsx",
  "Page/vendor/AddVenue/Components/InputField.tsx": "pages/vendor/AddVenue/components/InputField.tsx",
  "Page/vendor/AddVenue/Components/Label.tsx": "pages/vendor/AddVenue/components/Label.tsx",
  "Page/vendor/AddVenue/Components/NavigationButtons.tsx": "pages/vendor/AddVenue/components/NavigationButtons.tsx",
  "Page/vendor/AddVenue/Components/SectionCard.tsx": "pages/vendor/AddVenue/components/SectionCard.tsx",
  "Page/vendor/AddVenue/Components/SelectField.tsx": "pages/vendor/AddVenue/components/SelectField.tsx",
  "Page/vendor/AddVenue/Components/StepAmenities.tsx": "pages/vendor/AddVenue/components/StepAmenities.tsx",
  "Page/vendor/AddVenue/Components/StepBar.tsx": "pages/vendor/AddVenue/components/StepBar.tsx",
  "Page/vendor/AddVenue/Components/StepBasicInfo.tsx": "pages/vendor/AddVenue/components/StepBasicInfo.tsx",
  "Page/vendor/AddVenue/Components/StepLocation.tsx": "pages/vendor/AddVenue/components/StepLocation.tsx",
  "Page/vendor/AddVenue/Components/StepReview.tsx": "pages/vendor/AddVenue/components/StepReview.tsx",
  "Page/vendor/AddVenue/Components/SuccessScreen.tsx": "pages/vendor/AddVenue/components/SuccessScreen.tsx",
  "Page/vendor/AddVenue/Components/TextareaField.tsx": "pages/vendor/AddVenue/components/TextareaField.tsx",
  "Page/vendor/AddVenue/Components/Toast.tsx": "pages/vendor/AddVenue/components/Toast.tsx",
  "Page/vendor/AddVenue/types/Constants.ts": "pages/vendor/AddVenue/types/Constants.ts",
  "Page/vendor/AddVenue/types/Interface.ts": "pages/vendor/AddVenue/types/Interface.ts",

  // Vendor EditVenues
  "Page/vendor/EditVenues/EditVenue.tsx": "pages/vendor/EditVenues/EditVenue.tsx",
  "Page/vendor/EditVenues/components/Pill.tsx": "pages/vendor/EditVenues/components/Pill.tsx",
  "Page/vendor/EditVenues/components/VenueCard.tsx": "pages/vendor/EditVenues/components/VenueCard.tsx",

  // errors
  "errors/NotFound.tsx": "pages/errors/NotFound.tsx",
  "errors/Unauthorized.tsx": "pages/errors/Unauthorized.tsx",

  // type -> types
  "type/booking.types.ts": "types/booking.types.ts",
  "type/common.types.ts": "types/common.types.ts",
  "type/user.types.ts": "types/user.types.ts",
  "type/venue.types.ts": "types/venue.types.ts",

  "components/vendor/VenueTable .tsx": "components/vendor/VenueTable.tsx"
};

for (const [oldRel, newRel] of Object.entries(moves)) {
  const oldPath = path.join(srcFolder, oldRel);
  const newPath = path.join(srcFolder, newRel);

  const sourceFile = project.getSourceFile(oldPath);
  if (sourceFile) {
    sourceFile.move(newPath);
  } else {
    console.log(`Could not find ${oldPath}`);
  }
}

project.saveSync();
console.log("Refactoring complete");
