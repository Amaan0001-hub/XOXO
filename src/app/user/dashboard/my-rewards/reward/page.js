
"use client";
import React, { useEffect } from "react";
import { RiMoneyDollarCircleLine, RiFlashlightLine, RiBatteryChargeLine } from "react-icons/ri";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useDispatch, useSelector } from "react-redux";
import { getPerformanceRewardListByURID } from "@/app/redux/slices/walletSlice";
import { getUserId } from "@/app/api/auth";

const Reward = () => {
  const dispatch = useDispatch();
  const { PerformanceRewardListData } = useSelector((state) => state.wallet);

  const salaryStrongLeg = PerformanceRewardListData?.performanceReward?.[0]?.RewardAchvd || "";
  const salarystrongLegBusines = PerformanceRewardListData?.performanceReward?.[0]?.LeftBuss || "";
  const salaryweakerLegBusines = PerformanceRewardListData?.performanceReward?.[0]?.SalaryweakerLegBusines || "";
  const salarystrongLegBusinesId = PerformanceRewardListData?.performanceReward?.[0]?.RightBuss || "";
  const salaryweakerLegBusinesId = PerformanceRewardListData?.performanceReward?.[0]?.PendingRight || "";
  const legwisefreshbus = PerformanceRewardListData?.performanceReward?.[0]?.PendingLeft || "";
  const remainingDirectBus = PerformanceRewardListData?.performanceReward?.[0]?.RemainingDirectBus || "";
  const NextReleaseDate = PerformanceRewardListData?.performanceReward?.[0]?.NextReleaseDate || "";

  useEffect(() => {
    const data = getUserId();
    dispatch(getPerformanceRewardListByURID(data));
  }, [dispatch]);

  const exportToExcel = () => {
    if (!PerformanceRewardListData?.performanceReward) return;
    const excelData = PerformanceRewardListData.performanceReward.map((rank, id) => ({
      Rank: rank.rRank,
      "Business Volume": rank.BusinessVolume,
      "Monthly Salary Duration": rank.MonthlySalaryDuration,
      "Speedy Reward": rank.SpeedyReward,
      Status: rank.Statusx,
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Performance Income");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Performance_Income_Report.xlsx");
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "$0.00";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="reward-dashboard">
      {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <button className="export-btn" onClick={exportToExcel}>
          Export Report
        </button>
      </div> */}

      <div className="stats-grid">
        {/* Your Rank Card */}
        <div className="it bg-p gl gl-p">
          <div className="stat-card-content">
            <div>
              <p className="stat-label">Achieved Rank</p>
              <p className="it-val">{salaryStrongLeg || "—"}</p>
            </div>
            <div className="stat-icon purple-bg">
              <RiFlashlightLine className="stat-icon-svg purple" />
            </div>
          </div>
        </div>

        {/* 1st Leg Id/Business Record - Multi-line like image */}
        <div className="it bg-p gl gl-p">
          <div className="stat-card-content">
            <div className="stat-text-wrapper">
              <p className="stat-label">Left/Right Business</p>
              <p className="it-val">{formatCurrency(salarystrongLegBusines || "—")}/ {formatCurrency(salarystrongLegBusinesId)}</p>
          
            </div>
            <div className="stat-icon pink-bg">
              <RiBatteryChargeLine className="stat-icon-svg pink" />
            </div>
          </div>
        </div>

        {/* 2nd Leg Id/Business Record - Multi-line like image */}
        <div className="it bg-p gl gl-p">
          <div className="stat-card-content">
            <div className="stat-text-wrapper">
              <p className="stat-label">Business Needed For Next Rank (L/R)</p>
              <p className="it-val">{formatCurrency(legwisefreshbus || "—")} / {formatCurrency(salaryweakerLegBusinesId)}</p>
         
            </div>
            <div className="stat-icon red-bg">
              <RiMoneyDollarCircleLine className="stat-icon-svg red" />
            </div>
          </div>
        </div>

        
      </div>

      {/* Performance Ranks Table */}
      <div className="card">
        <table className="data-table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">#</th>
              <th className="table-header-cell">Titile</th>
              <th className="table-header-cell">Business Volume</th>
              <th className="table-header-cell">Reward</th>
            
              <th className="table-header-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {PerformanceRewardListData?.performanceReward?.length > 0 ? (
              PerformanceRewardListData.performanceReward.map((rank, index) => (
                <tr key={index} className="table-row">
                  <td className="td-cell">{index + 1}</td>
                  <td className="td-cell rank-name">{rank.RewardTitle}</td>
                  <td className="td-cell">${rank.RequiredBusiness}</td>
                  <td className="td-cell">{rank.Amount}</td>
               
                  <td className="td-cell">
                    <span className={`status-badge ${rank.Statusx === "Qualify " ? "qualify" : rank.Statusx === "Not Qualify" ? "NotQualify" : ""}`}>
                      {rank.Statusx}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-row">
                  No performance reward data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

   
    </div>
  );
};

export default Reward;