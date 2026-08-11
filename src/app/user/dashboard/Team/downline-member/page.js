"use client";
import React, { useState, useEffect, useMemo } from "react";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AuthLogin } from "@/app/api/auth";
import { LeftRightDownline } from "@/app/redux/slices/fundManagerSlice";

const DownlineMember = ({ isDownline = false }) => {
    const dispatch = useDispatch();
    const authLogin = AuthLogin();

    const { LeftRightDownlineData, loading, error } = useSelector(
        (state) => state?.fund || {}
    );

    const teamMembersRaw = LeftRightDownlineData?.data?.leftRightdownline || [];

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSide, setSelectedSide] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 10;

    const [teamParams, setTeamParams] = useState({
        side: "",
        kid: 0,
        fromdate: "",
        toDate: ""
    });

    const fetchDownline = async (sideValue) => {
        try {
            const params = {
                side: sideValue,
                kid: 0,
                fromdate: "",
                toDate: ""
            };
      
            await dispatch(LeftRightDownline(params));
        } catch (error) {
            console.error("Error fetching downline:", error);
        }
    };

    useEffect(() => {
        fetchDownline("");
    }, [dispatch, authLogin]);

    const handleSideChange = (side) => {
        setSelectedSide(side);
        setCurrentPage(1);
        setSearchTerm(""); 
        if (side === "All") fetchDownline("");
        else if (side === "Left") fetchDownline("L");
        else if (side === "Right") fetchDownline("R");
    };

    // Filter members based on search term
    const filteredMembers = useMemo(() => {
        if (!searchTerm.trim()) {
            return teamMembersRaw;
        }
        
        const searchLower = searchTerm.toLowerCase().trim();
        return teamMembersRaw.filter((member) => {
            return (
                (member.Name && member.Name.toLowerCase().includes(searchLower)) ||
                (member.loginid && member.loginid.toLowerCase().includes(searchLower)) ||
                (member.SponserId && member.SponserId.toString().toLowerCase().includes(searchLower)) ||
                (member.Urid && member.Urid.toString().includes(searchLower))
            );
        });
    }, [teamMembersRaw, searchTerm]);

    const totalPages = Math.ceil(filteredMembers?.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMembers = filteredMembers.slice(startIndex, endIndex);

    const handlePrevious = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNext = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const clearSearch = () => {
        setSearchTerm("");
        setCurrentPage(1);
    };

    const allCount = teamMembersRaw.length;

    return (
        <div className="downline-member-wrapper">
            <div className="downline-member-header">
                <div className="downline-member-header-inner">
                    <div className="downline-member-title">
                        {isDownline ? "Downline Team" : "Direct Referral Team"}
                    </div>
                    <div className="downline-member-filter">
                        <select
                            value={selectedSide}
                            onChange={(e) => handleSideChange(e.target.value)}
                            className="downline-member-select"
                        >
                            <option value="All">All Team</option>
                            <option value="Left">Left Team</option>
                            <option value="Right">Right Team</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Search Box */}
            <div className="downline-member-search-container">
                <div>
                    
                    <input
                        type="text"
                        placeholder="Search by Name, Login ID, or Sponsor ID..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                   
                </div>
                {searchTerm && (
                    <div className="downline-member-search-results-info">
                        Found {filteredMembers.length} result(s) for "{searchTerm}"
                    </div>
                )}
            </div>

            <div className="downline-member-table-container">
                {loading && (
                    <div className="downline-member-loading">
                        Loading team data...
                    </div>
                )}
                {error && (
                    <div className="downline-member-error">Error: {error}</div>
                )}
                <div className="downline-member-table-content">
                    {loading ? (
                        <div className="downline-member-loader">
                            <div className="downline-member-spinner"></div>
                        </div>
                    ) : (
                        <>
                            <div className="downline-member-table-scroll">
                                <div className="downline-member-table-inner">
                                    <table className="downline-member-table">
                                        <thead className="downline-member-thead">
                                            <tr>
                                                <th className="downline-member-th">Sr No</th>
                                                <th className="downline-member-th">Name</th>
                                                <th className="downline-member-th">Login ID</th>
                                                <th className="downline-member-th">Reg. Date</th>
                                                <th className="downline-member-th">Sponser ID</th>
                                                <th className="downline-member-th">Position</th>
                                                <th className="downline-member-th downline-member-hide-xl">Package</th>
                                                <th className="downline-member-th downline-member-hide-lg">Topup Date</th>
                                                <th className="downline-member-th downline-member-hide-xl">Left Business</th>
                                                <th className="downline-member-th downline-member-hide-xl">Right Business</th>
                                                <th className="downline-member-th">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="downline-member-tbody">
                                            {currentMembers && currentMembers?.length > 0 ? (
                                                currentMembers.map((member, index) => (
                                                    <tr key={member.Urid || index} className="downline-member-row">
                                                        <td className="downline-member-td">
                                                            {startIndex + index + 1}
                                                        </td>
                                                        <td className="downline-member-td downline-member-name">
                                                            {member.Name}
                                                        </td>
                                                        <td className="downline-member-td">
                                                            {member.loginid}
                                                        </td>
                                                        <td className="downline-member-td">
                                                            {member.RegDate || "Null"}
                                                        </td>
                                                        <td className="downline-member-td">
                                                            {member.SponserId}
                                                        </td>
                                                        <td className="downline-member-td">
                                                            <span className={`downline-member-side ${
                                                                member.introSide === "L" || member.introSide === "L" 
                                                                    ? "side-left" 
                                                                    : "side-right"
                                                            }`}>
                                                                {member.introSide || member.introSide || "N/A"}
                                                            </span>
                                                        </td>
                                                        <td className="downline-member-td downline-member-hide-xl">
                                                            ${parseFloat(member.Package).toLocaleString()}
                                                        </td>
                                                        <td className="downline-member-td downline-member-hide-lg">
                                                            {member.TopupDate || "Null"}
                                                        </td>
                                                        <td className="downline-member-td downline-member-hide-xl">
                                                            ${member.LBuss?.toLocaleString()}
                                                        </td>
                                                        <td className="downline-member-td downline-member-hide-xl">
                                                            ${member.RBuss?.toLocaleString()}
                                                        </td>
                                                        <td className="downline-member-td">
                                                            <span className="downline-member-status-badge">
                                                                Active
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="11" className="downline-member-no-data">
                                                        {searchTerm 
                                                            ? `No results found for "${searchTerm}"` 
                                                            : `No team members found for ${selectedSide} side`}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {filteredMembers?.length > 0 && (
                                <div className="downline-member-pagination">
                                    <div className="downline-member-pagination-info">
                                        Showing {startIndex + 1} to{" "}
                                        {Math.min(endIndex, filteredMembers?.length)} of{" "}
                                        {filteredMembers?.length} members
                                    </div>
                                    <div className="downline-member-pagination-buttons">
                                        <button
                                            onClick={handlePrevious}
                                            disabled={currentPage === 1}
                                            className="downline-member-page-btn downline-member-page-prev"
                                        >
                                            <ChevronLeft className="downline-member-page-icon" />
                                            <span>Previous</span>
                                        </button>
                                        <div className="downline-member-page-current">
                                            {currentPage} / {totalPages}
                                        </div>
                                        <button
                                            onClick={handleNext}
                                            disabled={currentPage === totalPages}
                                            className="downline-member-page-btn downline-member-page-next"
                                        >
                                            <span>Next</span>
                                            <ChevronRight className="downline-member-page-icon" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DownlineMember;