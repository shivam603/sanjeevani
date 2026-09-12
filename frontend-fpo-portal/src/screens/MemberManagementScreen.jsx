import React, { useState } from 'react';
import MemberPassportModal from '../components/MemberPassportModal';

export default function MemberManagementScreen({ members = [], onFetchMemberPassport, onFlagMember }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNeedsUpdate, setFilterNeedsUpdate] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState('ALL');
  const [activePassport, setActivePassport] = useState(null);
  const [isLoadingPassport, setIsLoadingPassport] = useState(false);
  const [flaggedMembers, setFlaggedMembers] = useState(new Set());

  // Filter members based on state
  const filtered = members.filter((m) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = m.full_name.toLowerCase().includes(q);
      const matchVillage = m.village.toLowerCase().includes(q);
      const matchCode = (m.farmer_code || '').toLowerCase().includes(q);
      if (!matchName && !matchVillage && !matchCode) return false;
    }

    const isFlaggedLocally = flaggedMembers.has(m.farmer_id);
    const needsUpdate = m.needs_data_update || isFlaggedLocally;

    if (filterNeedsUpdate && !needsUpdate) {
      return false;
    }

    if (selectedVillage !== 'ALL' && m.village !== selectedVillage) {
      return false;
    }

    return true;
  });

  const villages = ['ALL', ...new Set(members.map((m) => m.village))];

  const handleOpenPassport = async (member) => {
    setIsLoadingPassport(true);
    try {
      if (onFetchMemberPassport) {
        const passport = await onFetchMemberPassport(member.farmer_id);
        setActivePassport(passport);
      } else {
        setActivePassport(member);
      }
    } finally {
      setIsLoadingPassport(false);
    }
  };

  const handleFlag = (farmerId) => {
    const updated = new Set(flaggedMembers);
    updated.add(farmerId);
    setFlaggedMembers(updated);
    if (onFlagMember) onFlagMember(farmerId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title & Filter Bar */}
      <div className="portal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Member Farmer Credit Directory
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Individual member passports, risk tiers, and telemetry freshness flags
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <input
              type="text"
              className="search-input"
              placeholder="Search member name, village, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Village Selector */}
            <select
              className="search-input"
              style={{ minWidth: '140px' }}
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
            >
              {villages.map((v) => (
                <option key={v} value={v}>
                  {v === 'ALL' ? 'All Villages' : v}
                </option>
              ))}
            </select>

            {/* Needs Update Toggle */}
            <button
              type="button"
              className={`btn ${filterNeedsUpdate ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterNeedsUpdate(!filterNeedsUpdate)}
            >
              ⚠️ Needs Update Only ({members.filter((m) => m.needs_data_update || flaggedMembers.has(m.farmer_id)).length})
            </button>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="portal-card" style={{ padding: 0 }}>
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Farmer Name</th>
                <th>Village</th>
                <th>Primary Crop</th>
                <th>Land Area</th>
                <th>AgriTrust Score</th>
                <th>Risk Tier</th>
                <th>Telemetry Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => {
                const isFlagged = member.needs_data_update || flaggedMembers.has(member.farmer_id);
                const score = member.agritrust_score;
                let badgeClass = 'badge-low';
                if (score < 50) badgeClass = 'badge-high';
                else if (score < 70) badgeClass = 'badge-mod';

                return (
                  <tr key={member.farmer_id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                        {member.farmer_code || 'NSK-100'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{member.full_name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Last Delivery: {member.last_delivery_date || 'None recorded'}
                      </div>
                    </td>
                    <td>{member.village}</td>
                    <td>{member.primary_crop}</td>
                    <td>{member.parcel_area_ha} Ha</td>
                    <td>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e' }}>
                        {score}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}> / 100</span>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass}`}>
                        {member.risk_category}
                      </span>
                    </td>
                    <td>
                      {isFlagged ? (
                        <span className="badge badge-warning-flag" title={member.missing_data_reasons?.join(', ')}>
                          ⚠️ Update Needed
                        </span>
                      ) : (
                        <span className="badge badge-low">
                          ✓ Up to Date
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleFlag(member.farmer_id)}
                          title="Send telemetry update alert"
                        >
                          🚩 Flag
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenPassport(member)}
                          disabled={isLoadingPassport}
                        >
                          View Passport
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Passport Modal */}
      {activePassport && (
        <MemberPassportModal
          passport={activePassport}
          onClose={() => setActivePassport(null)}
          onFlagUpdate={(id) => handleFlag(id)}
        />
      )}
    </div>
  );
}
