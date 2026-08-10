"use client";

import React, { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllAdminListbyPermission,
  MenusmenuAndSubMenuPermisiom,
  addPermission,
} from "@/app/redux/slices/menuSlice";
import { toast } from "react-toastify";
import { FaCheckCircle, FaRegCheckCircle, FaUsers, FaShieldAlt, FaSave, FaListAlt, FaCaretRight, FaPlusCircle } from "react-icons/fa";
import { RiShieldKeyholeLine, RiAdminLine, RiMenuLine, RiLockLine } from "react-icons/ri";
import { IoMdArrowDropright } from "react-icons/io";

export default function MenuPermission() {
  const dispatch = useDispatch();
  const { fetchAdminList, menuAndSubMenuPermission, loading } = useSelector(
    (state) => state.menu
  );
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  let toastShown = false;

  const getSelectedCounts = () => {
    const menuCount = permissions.filter((m) => m.hasMenuPermission).length;
    const subMenuCount = permissions.reduce(
      (count, menu) =>
        count + (menu.subMenus?.filter((sub) => sub.hasSubMenuPermission).length || 0),
      0
    );
    return { menuCount, subMenuCount };
  };

  useEffect(() => {
    dispatch(getAllAdminListbyPermission());
  }, [dispatch]);

  const handleChange = (e) => {
    const adminId = e.target.value;
    setSelectedAdmin(adminId);
    if (adminId) {
      dispatch(MenusmenuAndSubMenuPermisiom(adminId));
    } else {
      setPermissions([]);
    }
  };

  useEffect(() => {
    if (menuAndSubMenuPermission?.length > 0) {
      setPermissions(menuAndSubMenuPermission);
    } else {
      setPermissions([]);
    }
  }, [menuAndSubMenuPermission]);

  const handlePermissionChange = (menuId, subMenuId = null) => {
    setPermissions((prev) =>
      prev.map((menu) => {
        if (menu.menuId === menuId) {
          if (subMenuId === null) {
            return { ...menu, hasMenuPermission: !menu.hasMenuPermission };
          } else {
            if (!menu.hasMenuPermission) {
              if (!toastShown) {
                toastShown = true;
                toast.warning("Please select Menu first!");
                setTimeout(() => (toastShown = false), 1000);
              }
              return menu;
            }
            const updatedSubMenus = menu.subMenus.map((sub) =>
              sub.subMenuId === subMenuId
                ? { ...sub, hasSubMenuPermission: !sub.hasSubMenuPermission }
                : sub
            );
            return { ...menu, subMenus: updatedSubMenus };
          }
        }
        return menu;
      })
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedAdmin) {
      toast.warning("⚠️ Please select an admin first");
      return;
    }

    const invalidMenus = permissions.filter(
      (menu) =>
        menu.hasMenuPermission &&
        (!menu.subMenus || !menu.subMenus.some((sub) => sub.hasSubMenuPermission))
    );

    if (invalidMenus.length > 0) {
      toast.warning(
        `Please select at least one SubMenu for menu: ${invalidMenus
          .map((m) => m.menuName)
          .join(", ")}`
      );
      return;
    }

    setSaving(true);

    try {
      const apiCalls = permissions.map((menu) =>
        dispatch(
          addPermission({
            appRoleId: selectedAdmin,
            menuId: menu.menuId,
            menuName: menu.menuName,
            pageName: menu.menuPageName,
            displayOrder: menu.menuDisplayOrder,
            createdBy: selectedAdmin,
            menuIcon: menu.menuIcon,
            activemenu: menu.hasMenuPermission,
            subMenuList:
              menu.subMenus?.map((sub) => ({
                subMenuId: sub.subMenuId,
                subMenuName: sub.subMenuName,
                subMenuPageName: sub.subMenuPageName,
                displayOrderSubMenu: sub.displayOrder,
                activeSubmenu: sub.hasSubMenuPermission,
              })) || [],
          })
        ).unwrap()
      );

      await Promise.all(apiCalls);
      toast.success("✅ All Menu and SubMenu Permissions saved successfully!");
    } catch (error) {
      console.error("❌ Failed to save permissions:", error);
      toast.error("Failed to save permissions. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const { menuCount, subMenuCount } = getSelectedCounts();

  return (
    <div>
      <div>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
              <RiShieldKeyholeLine className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Menu Permission
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
                <FaShieldAlt className="text-emerald-500" />
                Manage menu & submenu access for admin users
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Admin Selection Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RiAdminLine className="text-xl" />
              Select Administrator
            </h2>
            <p className="text-emerald-100 text-sm mt-1">Choose an admin user to configure permissions</p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading admin list...</p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
                <label className="block mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                  Select Admin User
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUsers className="h-4 w-4 text-emerald-500" />
                  </div>
                  <select
                    value={selectedAdmin}
                    onChange={handleChange}
                    className="w-full sm:w-80 pl-10 pr-4 py-2.5 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium text-sm transition-all duration-200 cursor-pointer"
                  >
                    <option value="">-- Select Admin --</option>
                    {fetchAdminList?.map((admin) => (
                      <option key={admin.adminUserId} value={admin.adminUserId}>
                        {admin.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Permission Count Badges */}
            {permissions?.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <RiLockLine className="text-emerald-500" />
                    Selected Permissions:
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-xs font-bold shadow-md">
                    <RiMenuLine className="text-xs" />
                    {menuCount} Menu{menuCount !== 1 ? 's' : ''}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-xs font-bold shadow-md">
                    <FaPlusCircle className="text-xs" />
                    {subMenuCount} SubMenu{subMenuCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Permission Table */}
            {permissions?.length > 0 && (
              <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-emerald-600 to-teal-600">
                    <tr>
                      <th className="p-3 text-center text-white font-semibold w-12">#</th>
                      <th className="p-3 text-center text-white font-semibold w-32">Menu Permission</th>
                      <th className="p-3 text-left text-white font-semibold">Menu Name</th>
                      <th className="p-3 text-center text-white font-semibold w-36">SubMenu Count</th>
                      <th className="p-3 text-center text-white font-semibold w-36">SubMenu Permission</th>
                      <th className="p-3 text-left text-white font-semibold">Sub Menus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((menu, menuIndex) => (
                      <Fragment key={menu.menuId}>
                        {/* Menu Row */}
                        <tr
                          className={`transition-colors duration-150 border-b border-gray-200 dark:border-gray-700
                            ${menuIndex % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50 dark:bg-gray-800/60"
                            } hover:bg-emerald-50 dark:hover:bg-emerald-900/20`}
                        >
                          <td className="p-3 text-center text-gray-500 dark:text-gray-400 font-medium">
                            {menuIndex + 1}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center">
                              {menu.hasMenuPermission ? (
                                <FaCheckCircle
                                  className="w-5 h-5 text-emerald-500 cursor-pointer hover:scale-110 transition-transform duration-200"
                                  onClick={() => handlePermissionChange(menu.menuId)}
                                  title="Click to uncheck"
                                />
                              ) : (
                                <FaRegCheckCircle
                                  className="w-5 h-5 text-gray-300 dark:text-gray-600 cursor-pointer hover:scale-110 transition-transform duration-200 hover:text-emerald-400"
                                  onClick={() => handlePermissionChange(menu.menuId)}
                                  title="Click to check"
                                />
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-emerald-700 dark:text-emerald-400">
                            <div className="flex items-center gap-2">
                              <RiMenuLine className="text-sm" />
                              {menu.menuName}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {menu.subMenus?.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                {menu.subMenus.filter((sub) => sub.hasSubMenuPermission).length} / {menu.subMenus.length}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center text-gray-400">—</td>
                          <td className="p-3 text-gray-400">—</td>
                        </tr>

                        {/* SubMenu Rows */}
                        {menu.subMenus?.map((sub) => (
                          <tr
                            key={sub.subMenuId}
                            className="bg-cyan-50/40 dark:bg-cyan-900/10 hover:bg-cyan-100/60 dark:hover:bg-cyan-900/20 border-b border-gray-100 dark:border-gray-700 transition-colors duration-150"
                          >
                            <td className="p-3"></td>
                            <td className="p-3"></td>
                            <td className="p-3 text-gray-400 dark:text-gray-600 text-xs pl-6">
                              <IoMdArrowDropright className="inline text-cyan-400 mr-1 text-lg" />
                            </td>
                            <td className="p-3 text-center text-gray-400">—</td>
                            <td className="p-3 text-center">
                              <div className="flex justify-center">
                                {sub.hasSubMenuPermission ? (
                                  <FaCheckCircle
                                    className="w-5 h-5 text-cyan-500 cursor-pointer hover:scale-110 transition-transform duration-200"
                                    onClick={() => handlePermissionChange(menu.menuId, sub.subMenuId)}
                                    title="Click to uncheck"
                                  />
                                ) : (
                                  <FaRegCheckCircle
                                    className="w-5 h-5 text-gray-300 dark:text-gray-600 cursor-pointer hover:scale-110 transition-transform duration-200 hover:text-cyan-400"
                                    onClick={() => handlePermissionChange(menu.menuId, sub.subMenuId)}
                                    title="Click to check"
                                  />
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <FaCaretRight className="text-sm text-cyan-500" />
                                <span className="text-cyan-700 dark:text-cyan-400 font-medium text-sm">
                                  {sub.subMenuName}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>

                {/* Save Button */}
                <div className="p-5 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <button
                    onClick={handleSavePermissions}
                    disabled={saving}
                    className="group px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shadow-md"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Permissions...
                      </>
                    ) : (
                      <>
                        <FaSave className="text-sm group-hover:scale-110 transition-transform" />
                        Save Permissions
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {selectedAdmin && permissions?.length === 0 && !loading && (
              <div className="mt-8 text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <FaListAlt className="text-3xl text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No permissions configured for this admin</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Select a different admin or configure permissions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}