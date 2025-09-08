import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Shield,
  Medal,
  Briefcase,
  ListChecks,
  Crown,
} from "lucide-react";

interface OrganizationDetailBlockProps {
  main?: {
    teamId: string;
    name: string;
  } | null;
  user?: {
    rank?: string;
    position?: string;
    job?: string;
    role?: string;
  };
}

export default function OrganizationDetailBlock({
  main,
  user,
}: OrganizationDetailBlockProps) {
  const metaItems = [
    { key: "rank", label: "직급", value: user?.rank || "", icon: Medal },
    {
      key: "position",
      label: "직위",
      value: user?.position || "",
      icon: Shield,
    },
    { key: "job", label: "직책", value: user?.job || "", icon: Briefcase },
    { key: "role", label: "직무", value: user?.role || "", icon: ListChecks },
  ].filter((m) => Boolean(m.value));

  return (
    <div className="space-y-4">
      {main ? (
        <div className="bg-white rounded-lg flex flex-col items-start">
          {metaItems.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-start w-full">
              {metaItems.map((m) => {
                const Icon = m.icon;
                return (
                  <Badge
                    key={m.key}
                    variant="outline"
                    className="inline-flex items-center gap-1.5 bg-white border-gray-200 px-3 py-1 text-xs"
                  >
                    <Icon className="w-3.5 h-3.5 text-gray-500 flex-none" />
                    <span className="text-gray-600 whitespace-nowrap">
                      {m.label}
                    </span>
                    <span className="font-medium text-gray-900">{m.value}</span>
                  </Badge>
                );
              })}
            </div>
          )}
          {metaItems.length === 0 && (
            <div className="text-sm text-gray-500 bg-white">
              직무/직책 정보가 없습니다.
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-500 p-4 bg-white rounded-lg border border-gray-200">
          조직 정보가 없습니다.
        </div>
      )}
    </div>
  );
}
