"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import toast, { Toaster } from "react-hot-toast";
import { requireAuth } from "../utils/auth";

interface Item {
  id: string;
  name: string;
  type: "department" | "location" | "receiver" | "site";
}
interface DepartmentLocationItem {
  _id: string;
  name: string;
}

export default function AddOns() {
  const [departments, setDepartments] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Item[]>([]);
  const [receiver, setReceiver] = useState<Item[]>([]);
  const [site, setSite] = useState<Item[]>([]);

  const [newDepartment, setNewDepartment] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newReceiver, setNewReceiver] = useState("");
  const [newSite, setNewSite] = useState("");

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [deptRes, locRes, recRes, siteRes] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/locations"),
          fetch("/api/receivers"),
          fetch("/api/sites"),
        ]);

        const [deptData, locData, recData, siteData] = await Promise.all([
          deptRes.json(),
          locRes.json(),
          recRes.json(),
          siteRes.json(),
        ]);

        setDepartments(
          deptData.map((item: DepartmentLocationItem) => ({
            id: item._id,
            name: item.name,
            type: "department",
          }))
        );
        setLocations(
          locData.map((item: DepartmentLocationItem) => ({
            id: item._id,
            name: item.name,
            type: "location",
          }))
        );
        setReceiver(
          recData.map((item: DepartmentLocationItem) => ({
            id: item._id,
            name: item.name,
            type: "receiver",
          }))
        );
        setSite(
          siteData.map((item: DepartmentLocationItem) => ({
            id: item._id,
            name: item.name,
            type: "site",
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAdd = async (
    type: "department" | "location" | "receiver" | "site"
  ) => {
    let name = "";
    if (type === "department") name = newDepartment;
    else if (type === "location") name = newLocation;
    else if (type === "receiver") name = newReceiver;
    else name = newSite;

    if (!name.trim()) return toast.error("Please enter a name");

    setIsLoading(true);
    try {
      const res = await fetch(`/api/${type}s`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.error || "Failed to add");

      const newItem = { ...data, id: data._id, type };
      switch (type) {
        case "department":
          setDepartments([...departments, newItem]);
          setNewDepartment("");
          break;
        case "location":
          setLocations([...locations, newItem]);
          setNewLocation("");
          break;
        case "receiver":
          setReceiver([...receiver, newItem]);
          setNewReceiver("");
          break;
        case "site":
          setSite([...site, newItem]);
          setNewSite("");
          break;
      }

      toast.success(`${type} added successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Error adding item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (
    id: string,
    type: "department" | "location" | "receiver" | "site"
  ) => {
    if (!confirm(`Delete this ${type}?`)) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/${type}s/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      const updateState = (setter: any, list: Item[]) =>
        setter(list.filter((item) => item.id !== id));

      switch (type) {
        case "department":
          updateState(setDepartments, departments);
          break;
        case "location":
          updateState(setLocations, locations);
          break;
        case "receiver":
          updateState(setReceiver, receiver);
          break;
        case "site":
          updateState(setSite, site);
          break;
      }

      toast.success(`${type} deleted.`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to delete ${type}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStart = (item: Item) => {
    setEditingItem(item);
    setEditValue(item.name);
  };

  const handleEditSave = async () => {
    if (!editingItem || !editValue.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/${editingItem.type}s/${editingItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editValue }),
        }
      );

      const updated = await res.json();
      if (!res.ok) return toast.error(updated.error || "Update failed");

      const updateState = (items: Item[], setter: any) =>
        setter(
          items.map((item) =>
            item.id === updated._id
              ? { ...updated, id: updated._id, type: editingItem.type }
              : item
          )
        );

      switch (editingItem.type) {
        case "department":
          updateState(departments, setDepartments);
          break;
        case "location":
          updateState(locations, setLocations);
          break;
        case "receiver":
          updateState(receiver, setReceiver);
          break;
        case "site":
          updateState(site, setSite);
          break;
      }

      toast.success(`${editingItem.type} updated.`);
      setEditingItem(null);
      setEditValue("");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const renderItemCard = (item: Item) => (
    <div
      key={item.id}
      className="bg-white border border-gray-200 p-4 rounded-md shadow-sm hover:shadow transition flex justify-between items-center"
    >
      {editingItem?.id === item.id ? (
        <div className="flex items-center w-full gap-3">
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEditSave();
              if (e.key === "Escape") setEditingItem(null);
            }}
            className="flex-1 px-4 py-2 border-2 border-blue-400 rounded-md outline-none focus:ring-2 focus:ring-blue-300 transition text-black bg-blue-50"
          />
          <button
            onClick={handleEditSave}
            className="text-green-600 hover:text-green-800"
            title="Save"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <>
          <span className="text-gray-800 font-medium flex-1">{item.name}</span>
          <div className="flex gap-3">
            <button
              onClick={() => handleEditStart(item)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDelete(item.id, item.type)}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );

  requireAuth();

  const renderSection = (
    title: string,
    items: Item[],
    newValue: string,
    onChange: (e: any) => void,
    onAdd: () => void
  ) => (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
        <span className="text-sm text-gray-500">{items.length}</span>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          value={newValue}
          onChange={onChange}
          placeholder={`New ${title.toLowerCase()}`}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-black"
        />
        <button
          onClick={onAdd}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          Add
        </button>
      </div>
      <div className="space-y-3">{items.map(renderItemCard)}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 md:ml-64">
      <Toaster position="top-right" />
      <Navbar />
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8">
          Manage Add-ons
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {renderSection("Departments", departments, newDepartment, (e) => setNewDepartment(e.target.value), () => handleAdd("department"))}
          {renderSection("Locations", locations, newLocation, (e) => setNewLocation(e.target.value), () => handleAdd("location"))}
          {renderSection("Receivers", receiver, newReceiver, (e) => setNewReceiver(e.target.value), () => handleAdd("receiver"))}
          {renderSection("Sites", site, newSite, (e) => setNewSite(e.target.value), () => handleAdd("site"))}
        </div>
      </main>
    </div>
  );
}
