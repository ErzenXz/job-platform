import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function CompanyProfile() {
  const company = useQuery(api.companies.getCurrentCompany);

  if (!company) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{company.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">🏢</span>
              <span className="font-medium mr-2">Industry:</span>
              {company.industry}
            </div>
            <div className="flex items-center">
              <span className="mr-2">👥</span>
              <span className="font-medium mr-2">Size:</span>
              {company.size}
            </div>
            <div className="flex items-center">
              <span className="mr-2">📍</span>
              <span className="font-medium mr-2">Location:</span>
              {company.location}
            </div>
            {company.website && (
              <div className="flex items-center">
                <span className="mr-2">🌐</span>
                <span className="font-medium mr-2">Website:</span>
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">About Us</h3>
          <p className="text-gray-700 leading-relaxed">{company.description}</p>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
          <p className="text-blue-800 text-sm">
            Your company profile helps candidates understand your organization better. 
            Make sure to keep your information up to date to attract the best talent!
          </p>
        </div>
      </div>
    </div>
  );
}
