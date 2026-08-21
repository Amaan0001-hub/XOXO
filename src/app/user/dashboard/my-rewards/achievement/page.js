
"use client";
import React, { useEffect } from "react";
import { 
  RiMoneyDollarCircleLine, 
  RiFlashlightLine, 
  RiBatteryChargeLine,
  RiMedalLine,
  RiTrophyLine,
  RiGeminiLine,
  RiStarLine,
  RiShieldStarLine,
  RiAwardLine,
  RiDiamondLine
} from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { getrankAchivement } from "@/app/redux/slices/walletSlice";
import { getUserId } from "@/app/api/auth";

const Achievement = () => {
  const dispatch = useDispatch();
  const { AchivementListData } = useSelector((state) => state.wallet);


  // Get the first object (MANAGER) for stats - or find the qualified one
  const firstRank = AchivementListData?.leaderShip?.[0] || {};
  
  // Find the current qualified rank (Statusx === "Qualify")
  const currentQualifiedRank = AchivementListData?.leaderShip?.find(
    (rank) => rank.Statusx === "Qualify"
  ) || firstRank;
  
  // Find the next rank (first "Not Qualify" after qualified ranks)
  const nextRank = AchivementListData?.leaderShip?.find(
    (rank) => rank.Statusx === "Not Qualify"
  );

  const achievedReward = firstRank?.YourRank || "—";
  const leftBusiness = firstRank?.LeftBuss || 0;
  const rightBusiness = firstRank?.RightBuss || 0;
  
  // For next rank requirement - show MatchingBussReq from next rank
  const nextRankRequired = nextRank?.MatchingBussReq || "—";
  const currentBusiness = Math.max(leftBusiness, rightBusiness);
  const businessNeeded = nextRankRequired !== "—" 
    ? Math.max(0, parseFloat(nextRankRequired.replace(/,/g, '')) - currentBusiness)
    : "—";

  const salaryweakerLegBusinesId = AchivementListData?.leaderShip?.[0]?.PendingRight || "";
  const legwisefreshbus = AchivementListData?.leaderShip?.[0]?.PendingLeft || "";
  
  useEffect(() => {
    const data = getUserId();
    dispatch(getrankAchivement(data));
  }, [dispatch]);

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "$0";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "$0";
    return `$${num.toLocaleString()}`;
  };

  const formatBusinessValue = (value) => {
    if (!value && value !== 0) return "0";
    if (typeof value === "string") return value;
    return value.toLocaleString();
  };

  // Function to get icon based on rank title
  const getRankIcon = (rankTitle, status) => {
    const iconProps = { 
      className: `rank-icon ${status === "Qualify" ? "qualified-icon" : "not-qualify-icon"}`,
      size: 20
    };
    
    switch(rankTitle?.toUpperCase()) {
      case "MANAGER":
        return <RiMedalLine {...iconProps} />;
      case "BRONZE":
        return <RiShieldStarLine {...iconProps} />;
      case "SILVER":
        return <RiStarLine {...iconProps} />;
      case "GOLD":
        return <RiTrophyLine {...iconProps} />;
      case "RUBY":
        return <RiGeminiLine {...iconProps} />;
      case "PLATINUM":
        return <RiAwardLine {...iconProps} />;
      case "DIAMOND":
        return <RiDiamondLine {...iconProps} />;
      default:
        return <RiMedalLine {...iconProps} />;
    }
  };

  return (
    <div className="reward-dashboard">
      <div className="stats-grid">
        {/* Achieved Reward Card */}
        <div className="it bg-p gl gl-p">
          <div className="stat-card-content">
            <div>
              <p className="stat-label">Achieved Rank</p>
              <p className="it-val">{achievedReward}</p>
            </div>
            <div className="stat-icon purple-bg">
              <RiFlashlightLine className="stat-icon-svg purple" />
            </div>
          </div>
        </div>

        {/* Left/Right Business Card */}
        <div className="it bg-p gl gl-p">
          <div className="stat-card-content">
            <div className="stat-text-wrapper">
              <p className="stat-label">Left / Right Business</p>
              <p className="it-val">
                {formatCurrency(leftBusiness)} / {formatCurrency(rightBusiness)}
              </p>
            </div>
            <div className="stat-icon pink-bg">
              <RiBatteryChargeLine className="stat-icon-svg pink" />
            </div>
          </div>
        </div>

        {/* Business Needed For Next Rank */}
        <div className="it bg-p gl gl-p">
          <div className="stat-card-content">
            <div className="stat-text-wrapper">
              <p className="stat-label">Business Needed For Next Rank (L/R)</p>
              <p className="it-val">{formatCurrency(legwisefreshbus)} / {formatCurrency(salaryweakerLegBusinesId)}</p>
            </div>
            <div className="stat-icon red-bg">
              <RiMoneyDollarCircleLine className="stat-icon-svg red" />
            </div>
          </div>
        </div>
      </div>

      {/* Ranks Table */}
     <div className="card">
        <table className="data-table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">#</th>
              <th className="table-header-cell">Title</th>
              <th className="table-header-cell">Required Business</th>
              <th className="table-header-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {AchivementListData?.leaderShip?.length > 0 ? (
              AchivementListData.leaderShip.map((rank, index) => (
                <tr key={index} className="table-row">
                  <td className="td-cell">{index + 1}</td>
                  <td className="td-cell rank-name">
                    <div className="rank-title-container">
                      {rank.RankIcon && (
                        <img 
                          src={rank.RankIcon} 
                          alt={rank.LRank} 
                          className="rank-icon-img"
                          style={{ width: '30px', height: '30px' }}
                        />
                      )}
                      <span>{rank.LRank}</span>
                    </div>
                  </td>
                  <td className="td-cell">${rank.MatchingBussReq}</td>
                  <td className="td-cell">
                    <span className={`status-badge ${rank.Statusx === "Qualify" ? "qualify" : "not-qualify"}`}>
                      {rank.Statusx}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty-row">
                  No rank achievement data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div> 
    </div>
  );
};

export default Achievement;