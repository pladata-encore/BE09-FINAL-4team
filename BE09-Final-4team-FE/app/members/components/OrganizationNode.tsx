import React from 'react';
import { ChevronRight, ChevronDown, Building2 } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  parentId?: string;
  members: any[];
  leader?: any;
  children?: Organization[];
}

interface OrganizationNodeProps {
  org: Organization;
  level: number;
  expandedOrgs: Set<string>;
  onToggle: (orgId: string) => void;
  onClick: (org: Organization) => void;
}

const OrganizationNode: React.FC<OrganizationNodeProps> = React.memo(({
  org,
  level,
  expandedOrgs,
  onToggle,
  onClick,
}) => {
  const isExpanded = expandedOrgs.has(org.id);
  const hasChildren = org.children && org.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
          level > 0 ? "ml-6" : ""
        }`}
        onClick={() => onClick(org)}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(org.id);
              }}
              className="p-1 hover:bg-gray-200 rounded cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="p-1 w-6 h-6 flex items-center justify-center">
              <span className="text-gray-400 text-lg">·</span>
            </div>
          )}
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{org.name}</span>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="border-l border-gray-200 ml-3">
          {org.children!.map((childOrg) => (
            <OrganizationNode
              key={childOrg.id}
              org={childOrg}
              level={level + 1}
              expandedOrgs={expandedOrgs}
              onToggle={onToggle}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
});

OrganizationNode.displayName = 'OrganizationNode';

export default OrganizationNode;
