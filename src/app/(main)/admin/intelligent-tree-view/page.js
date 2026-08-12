
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Tree from "react-d3-tree";
import { FaRegFile, FaSearch, FaNetworkWired, FaExpandAlt, FaCompressAlt, FaSitemap, FaUsers } from "react-icons/fa";
import { RiUserSearchLine, RiTreeLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { getNetworkTreeAdmin } from "@/app/redux/slices/walletSlice";
import toast from "react-hot-toast";
import Loading from "@/app/common/loading";

const buildTreeData = (data, collapsedNodes, searchUserId) => {
  if (!Array.isArray(data) || data.length === 0) return [];

  // Remove duplicates based on Loginid
  const uniqueData = data.filter(
    (node, index, self) =>
      index === self.findIndex((n) => n.Loginid === node.Loginid)
  );
  

  // Create a map for all nodes
  const nodeMap = new Map();
  
  // First pass: Create all nodes
  uniqueData.forEach((node) => {
    nodeMap.set(node.Loginid, {
      name: node.Name || node.Loginid,
      loginid: node.Loginid,
      attributes: {
        sponsor: node.SponsorId,
        downline: node.TotalTeam || 0,
        email: node.Email,
        regDate: node.RegDate,
        leaseAmount: node.Package || 0,
        urank: node.Urank,
        teamBusiness: node.TeamBusiness,
        activeTeam: node.ActiveTeam,
        directBusiness: node.DirectBusiness,
        topupDate: node.TopupDate,
        totalTeam: node.TotalActiveDirect || 0,
        mobile: node.Mobile,
        uLvl: node.uLvl,
        ActivationDate: node.ActivationDate,
        leftTeam: node.LeftTeam,
        rightTeam: node.RightTeam,
        leftAvtive: node.LeftActiveTeam,
        RightAvtive: node.RightActiveTeam,
        leftBusiness: node.LeftBussiness,
        rightBusiness: node.RightBussiness,
        isActive: node.ActivationDate === "Activated",
      },
      children: [],
      __rd3t: {
        collapsed: collapsedNodes.get(node.Loginid) ?? true,
      },
    });
  });

  // Second pass: Build parent-child relationships
  uniqueData.forEach((node) => {
    const currentNode = nodeMap.get(node.Loginid);
    if (currentNode && node.SponsorId && nodeMap.has(node.SponsorId)) {
      // Add as child to sponsor
      nodeMap.get(node.SponsorId).children.push(currentNode);
    }
  });

  // Find root nodes - the searched user should be the root
  let roots = [];
  
  if (searchUserId && nodeMap.has(searchUserId)) {
    // The searched user is the root
    const searchNode = nodeMap.get(searchUserId);
    
    // Remove it from any parent's children if it exists as a child
    for (const [_, parent] of nodeMap) {
      const index = parent.children.findIndex(child => child.loginid === searchUserId);
      if (index !== -1) {
        parent.children.splice(index, 1);
        break;
      }
    }
    
    roots = [searchNode];
  } else {
    // If no search userId, find all nodes that are not children of any other node
    roots = Array.from(nodeMap.values()).filter(node => {
      let isChild = false;
      for (const [_, parent] of nodeMap) {
        if (parent.children.includes(node)) {
          isChild = true;
          break;
        }
      }
      return !isChild;
    });
    
    // If still no roots, use all nodes
    if (roots.length === 0 && nodeMap.size > 0) {
      roots = Array.from(nodeMap.values());
    }
  }

 
  

  // Set initial collapse state
  if (roots.length > 0) {
    roots.forEach((root) => {
      root.__rd3t.collapsed = false;
      
      // Collapse deeper levels
      const collapseDeepChildren = (node, depth) => {
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => {
            if (depth >= 1) {
              child.__rd3t.collapsed = true;
            }
            collapseDeepChildren(child, depth + 1);
          });
        }
      };
      
      collapseDeepChildren(root, 0);
    });
  }

  return roots;
};

const CustomNode = ({ nodeDatum, toggleNode }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 10, left: 0 });
  const nodeRef = useRef(null);

  const leaseAmount = nodeDatum.attributes?.leaseAmount || 0;
  const headerColor = leaseAmount > 0 ? "from-green-500 to-emerald-600" : "from-red-500 to-rose-600";

  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    return num % 1 === 0 ? num.toString() : num.toString();
  };

  const handleMouseEnter = () => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + window.scrollY - 60,
        left: rect.left + window.scrollX + 80,
      });
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleCopyClick = () => {
    const nodeData = {
      Username: nodeDatum.loginid
    };

    const dataString = Object.entries(nodeData)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    navigator.clipboard
      .writeText(dataString)
      .then(() => {
        toast.success("Username copied to clipboard!");
      })
      .catch((err) => {
     
        toast.error("Failed to copy data");
      });
  };

  return (
    <foreignObject
      width={220}
      height={240}
      x={-110}
      y={-120}
      className="flex items-center justify-center"
      pointerEvents="none"
    >
      <div
        ref={nodeRef}
        style={{ pointerEvents: "auto" }}
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseOver={handleMouseEnter}
        onMouseOut={handleMouseLeave}
      >
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${headerColor} text-white rounded-t-xl flex justify-between items-center px-3 py-2`}
        >
          <button 
            className="hover:scale-110 transition-transform duration-200 cursor-pointer" 
            onClick={handleCopyClick}
            title="Copy Username"
          >
            <FaRegFile className="text-sm" />
          </button>
          <span className="text-sm font-mono font-semibold px-2 py-0.5 rounded cursor-default select-text">
            {nodeDatum.loginid || ""}
          </span>
          <div className="w-5"></div>
        </div>

        {/* Content */}
        <div className="p-3 text-center">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2 truncate" title={nodeDatum.name}>
            {nodeDatum.name}
          </h3>

          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Package: <span className="font-semibold text-emerald-600 dark:text-emerald-400">${leaseAmount.toLocaleString()}</span>
          </p>

          <p className="text-xs text-gray-600 dark:text-gray-400">
            Total Direct: <span className="font-semibold text-blue-600 dark:text-blue-400">{nodeDatum.attributes?.totalTeam || 0}</span>
          </p>
        </div>

        {/* Expand/Collapse Buttons */}
        {nodeDatum.children && nodeDatum.children.length > 0 && (
          <div className="mb-3 text-center">
            {nodeDatum.__rd3t?.collapsed ? (
              <button
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode();
                }}
              >
                <FaExpandAlt className="text-xs" />
                Expand
              </button>
            ) : (
              <button
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode();
                }}
              >
                <FaCompressAlt className="text-xs" />
                Collapse
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: tooltipPos.top,
              left: tooltipPos.left,
              width: 280,
              maxHeight: 250,
              backgroundColor: "#1f2937",
              color: "#f3f4f6",
              fontSize: "0.7rem",
              borderRadius: "0.75rem",
              padding: "0.75rem",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
              zIndex: 9999,
              overflowY: "auto",
              border: "1px solid #374151",
            }}
            className="scrollbar-thin scrollbar-thumb-gray-600"
          >
            <div className="space-y-1">
              <p className="text-gray-300"><span className="font-semibold text-emerald-400">SponsorId:</span> {nodeDatum.attributes?.sponsor || "None"}</p>
              <p className="text-gray-300"><span className="font-semibold text-emerald-400">Activated Date:</span> {nodeDatum.attributes?.ActivationDate || "Not Activated"}</p>
              <p className="text-gray-300"><span className="font-semibold text-emerald-400">Left Team:</span> {formatAmount(nodeDatum.attributes?.leftTeam || 0)}</p>
              <p className="text-gray-300"><span className="font-semibold text-emerald-400">Right Team:</span> {formatAmount(nodeDatum.attributes?.rightTeam || 0)}</p>
              <p className="text-gray-300"><span className="font-semibold text-emerald-400">Left Active:</span> {formatAmount(nodeDatum.attributes?.leftAvtive || 0)}</p>
              <p className="text-gray-300"><span className="font-semibold text-emerald-400">Right Active:</span> {formatAmount(nodeDatum.attributes?.RightAvtive || 0)}</p>
              <p className="text-gray-300"><span className="font-semibold text-emerald-400">Left Business:</span> ${nodeDatum.attributes?.leftBusiness || 0}</p>
              <p className="text-gray-300"><span className="font-semibold text-emerald-400">Right Business:</span> ${nodeDatum.attributes?.rightBusiness || 0}</p>
            </div>
          </div>,
          document.body
        )}
    </foreignObject>
  );
};

export default function IntelligentTreeView() {
  const dispatch = useDispatch();
  const { getNetworkTreeAdminData, loading } = useSelector((state) => state.wallet);

  const containerRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 400, y: 100 });
  const [collapsedNodes, setCollapsedNodes] = useState(new Map());
  const [userId, setUserId] = useState("");
  const [errors, setErrors] = useState({});
  const [searched, setSearched] = useState(false);

  const treeData = useMemo(
    () =>
      buildTreeData(
        Array.isArray(getNetworkTreeAdminData)
          ? getNetworkTreeAdminData
          : getNetworkTreeAdminData || [],
        collapsedNodes,
        userId // Pass the search userId to buildTreeData
      ),
    [getNetworkTreeAdminData, collapsedNodes, userId]
  );

  const handleSearch = () => {
    const newErrors = {};
    if (!userId.trim()) {
      newErrors.title = "UserID is required";
      setErrors(newErrors);
      return;
    }
    setErrors({});
    dispatch(getNetworkTreeAdmin(userId));
    setSearched(true);
  };

  useEffect(() => {
    setSearched(false);
  }, [userId]);

  useEffect(() => {
    if (treeData && treeData.length > 0 && containerRef.current) {
      const newTranslateX = containerRef.current.offsetWidth / 2;
      const newTranslateY = 100;
      if (translate.x !== newTranslateX || translate.y !== newTranslateY) {
        setTranslate({ x: newTranslateX, y: newTranslateY });
      }
    }
  }, [treeData, translate]);

  return (
    <div>
      <div>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
              <FaSitemap className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Intelligent Tree View
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
                <FaNetworkWired className="text-emerald-500" />
                Visualize your network hierarchy
              </p>
            </div>
          </div>
        </div>

        {/* Search Form Card */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RiUserSearchLine className="text-xl" />
              Search User
            </h2>
            <p className="text-emerald-100 text-sm mt-1">Enter user ID to view their network tree</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  placeholder="Enter user ID"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                {errors.title && (
                  <div className="mt-2 text-sm text-red-500">{errors.title}</div>
                )}
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Actions
                </label>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="group px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-md"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <FaSearch className="text-sm group-hover:scale-110 transition-transform" />
                      View Network Tree
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tree View Section */}
        {searched && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <RiTreeLine className="text-emerald-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Network Visualization {userId && <span className="text-emerald-600">- User: {userId}</span>}
                </span>
              </div>
            </div>

            <div
              ref={containerRef}
              className="w-full h-[70vh] min-h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loading />
                </div>
              ) : treeData && treeData.length > 0 ? (
                <Tree
                  data={treeData}
                  translate={translate}
                  orientation="vertical"
                  renderCustomNodeElement={(rd3tProps) => (
                    <CustomNode {...rd3tProps} />
                  )}
                  pathFunc="diagonal"
                  nodeSize={{ x: 260, y: 320 }}
                  zoomable={true}
                  draggable={true}
                  onNodeToggle={(node, toggled) => {
                    setCollapsedNodes((prev) =>
                      new Map(prev).set(node.loginid, toggled)
                    );
                  }}
                  initialDepth={1}
                  separation={{ siblings: 1.2, nonSiblings: 1.5 }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <FaSitemap className="text-4xl text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No data found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No network tree available for this User ID</p>
                </div>
              )}
            </div>

            {/* Tree Controls Info */}
            {treeData && treeData.length > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Active User</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Inactive User</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaExpandAlt className="text-xs" />
                    <span>Expand Node</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaCompressAlt className="text-xs" />
                    <span>Collapse Node</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🖱️</span>
                    <span>Drag to pan</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔍</span>
                    <span>Scroll to zoom</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}