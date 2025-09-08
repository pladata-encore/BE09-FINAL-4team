import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2 } from "lucide-react";
import { TeamInfo } from "./types";

interface OrgBlockProps {
  main?: TeamInfo | null;
  concurrent?: TeamInfo[];
  user?: {
    rank?: string;
    position?: string;
    job?: string;
    role?: string;
  };
}

export default function OrganizationBlock({
  main,
  concurrent = [],
  user,
}: OrgBlockProps) {
  const teamsToDisplay = concurrent;

  return (
    <Tabs defaultValue="main" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-100 border border-gray-200">
        <TabsTrigger
          value="main"
          className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600"
        >
          메인 조직
        </TabsTrigger>
        <TabsTrigger
          value="concurrent"
          className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600"
        >
          겸직 조직
        </TabsTrigger>
      </TabsList>

      <TabsContent value="main" className="mt-4">
        {main ? (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <div className="text-sm font-semibold text-gray-900 truncate">
                {main.name}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
            메인 조직 정보가 없습니다.
          </div>
        )}
      </TabsContent>

      <TabsContent value="concurrent" className="mt-4">
        {teamsToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teamsToDisplay.map((team) => (
              <div
                key={team.teamId}
                className="bg-gray-50 rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {team.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
            겸직 조직 정보가 없습니다.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}