"use client";

export default function ArbionEngine() {
  const copyRef2 = () => {
    const refLink = "https://arbion.ai/ref/ARB-a9x7k2";
    navigator.clipboard.writeText(refLink);
    alert("Referral link copied to clipboard!");
  };

  return (
    <>
        

      <div className="page" id="p-community">
        <div className="stats-grid-four">
          <div className="scard stat-card-compact">
            <div className="stat-label-compact">Direct Referrals</div>
            <div className="stat-value-primary stat-value-large">12</div>
            <div className="stat-meta neutral">L1 team</div>
          </div>
          <div className="scard stat-card-compact">
            <div className="stat-label-compact">Commission</div>
            <div className="stat-value-secondary stat-value-large">$841</div>
            <div className="stat-meta up">▲ +$64 today</div>
          </div>
          <div className="scard stat-card-compact">
            <div className="stat-label-compact">Team Volume</div>
            <div className="stat-value-large">$92k</div>
            <div className="stat-meta up">▲ +$8.2k</div>
          </div>
          <div className="scard stat-card-compact">
            <div className="stat-label-compact">Network Rank</div>
            <div className="stat-value-accent stat-value-large">#47</div>
            <div className="stat-meta warning">Gold tier</div>
          </div>
        </div>

        <div className="grid-two-col">
          <div className="scard community-tree-card">
            <div className="section-header">
              <div className="section-title">Community Tree</div>
            </div>
            <div className="community-tree" id="cTree"></div>
          </div>

          <div className="right-col-referral">
            <div className="scard referral-card">
              <div className="section-title">Your Referral Link</div>
              <div className="referral-link">https://arbion.ai/ref/ARB-a9x7k2</div>
              <button className="btn btn-secondary copy-button" id="copyRefBtn2" onClick={copyRef2}>
                📋 Copy Link
              </button>
              <div className="alert alert-success">
                Earn up to 8% on referred profits · 3-level deep
              </div>
            </div>

            <div className="scard tiers-card">
              <div className="section-title">Commission Tiers</div>
              <div className="table-wrapper">
                <table className="data-table compact-table">
                  <thead>
                    <tr>
                      <th>Level</th>
                      <th>Rate</th>
                      <th>Volume</th>
                      <th>Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="tag tag-green">L1</span></td>
                      <td>8%</td>
                      <td className="volume-value">$62,400</td>
                      <td className="earned-value">$499</td>
                    </tr>
                    <tr>
                      <td><span className="tag tag-cyan">L2</span></td>
                      <td>5%</td>
                      <td className="volume-value">$28,000</td>
                      <td className="earned-value">$140</td>
                    </tr>
                    <tr>
                      <td><span className="tag tag-purple">L3</span></td>
                      <td>3%</td>
                      <td className="volume-value">$6,600</td>
                      <td className="earned-value">$198</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="scard progress-card">
              <div className="section-title">Rank Progress</div>
              <div className="progress-wrapper">
                <div className="progress-header">
                  <span>Gold → Platinum</span>
                  <span className="progress-percentage">67%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: "67%" }}></div>
                </div>
              </div>
              <div className="progress-note">
                Need $8.2k more team volume for Platinum
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}