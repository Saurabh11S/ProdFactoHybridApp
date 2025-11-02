import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
  
  interface UserProfile {
    name: string;
    email: string;
    adharCard: string;
    panCard: string;
    mobile: string;
    dob: string;
  }
  
  interface ServiceDetails {
    serviceName: string;
    purchaseDate: string;
    documents: string[];
  }
  
  interface ServiceUserDetailsProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    serviceDetails: ServiceDetails;
  }
  
  export function ServiceUserDetails({
    isOpen,
    onClose,
    userProfile,
    serviceDetails,
  }: ServiceUserDetailsProps) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl h-[80vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">User Details</DialogTitle>
          </DialogHeader>
  
          {/* User Profile Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Profile Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(userProfile).map((key) => (
                  <div className="flex justify-between items-center" key={key}>
                    <p className="font-medium text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, " $1")}:
                    </p>
                    <p className="text-gray-800">{userProfile[key as keyof UserProfile]}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
  
          {/* Service Details Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-600">Service Name:</p>
                  <p className="text-gray-800">{serviceDetails.serviceName}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-600">Purchase Date:</p>
                  <p className="text-gray-800">{serviceDetails.purchaseDate}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Associated Documents:</p>
                  <ul className="mt-2 list-disc list-inside text-gray-800">
                    {serviceDetails.documents.map((doc, index) => (
                      <li key={index}>
                        <Button variant="link" className="text-blue-500">
                          {doc}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
  
          <div className="flex justify-end mt-6 space-x-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  