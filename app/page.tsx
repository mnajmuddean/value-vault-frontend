/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { getPremisesLatest } from "@/lib/getPremisesLatest";

import { useEffect, useState } from "react";
import { searchItems } from "@/lib/searchApi";
import { getItems } from "@/lib/getItems";
import { getPremises } from "@/lib/getPremises";
import { searchPremises } from "@/lib/searchPremisesApi";
import { calculateComparison } from "@/lib/calculateApi";
import {
  Search,
  TrendingUp,
  MapPin,
  Store,
  ArrowLeftRight,
  Check,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ItemsDataTable } from "@/components/ui/items-data-table";
import Link from "next/link";

export default function Page() {
  // State for modal price data
  const [premisesLatestData, setPremisesLatestData] = useState<any[]>([]);
  const [premisesLatestLoading, setPremisesLatestLoading] = useState(false);
  const [premisesLatestError, setPremisesLatestError] = useState<string | null>(
    null
  );
  // Modal state for viewing price data at a premises
  const [viewPremisesModal, setViewPremisesModal] = useState<{
    open: boolean;
    premises: any | null;
  }>({ open: false, premises: null });

  // Handler to open modal with selected premises
  const handleViewPriceData = async (premises: any) => {
    setViewPremisesModal({ open: true, premises });
    setPremisesLatestLoading(true);
    setPremisesLatestError(null);
    setPremisesLatestData([]);
    try {
      const data = await getPremisesLatest(premises.premise_code);
      setPremisesLatestData(data?.data || []);
    } catch (e) {
      setPremisesLatestError("Failed to load price data.");
      setPremisesLatestData([]);
    } finally {
      setPremisesLatestLoading(false);
    }
  };

  // Handler to close modal
  const closeViewPremisesModal = () => {
    setViewPremisesModal({ open: false, premises: null });
  };
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [selectedPremises, setSelectedPremises] = useState<number[]>([]);
  const [selectedPremisesDetails, setSelectedPremisesDetails] = useState<any[]>(
    []
  );
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [itemsData, setItemsData] = useState<any[]>([]);
  const [itemsSearchResults, setItemsSearchResults] = useState<any[]>([]);
  const [itemsSearchActive, setItemsSearchActive] = useState(false);
  const [premisesData, setPremisesData] = useState<any[]>([]);
  const [premisesSearchQuery, setPremisesSearchQuery] = useState("");
  const [premisesSearchResults, setPremisesSearchResults] = useState<any[]>([]);
  const [premisesSearchLoading, setPremisesSearchLoading] = useState(false);
  const [premisesSearchError, setPremisesSearchError] = useState<string | null>(
    null
  );
  // Track if user has interacted with premises selection after first load
  const [premisesTouched, setPremisesTouched] = useState(false);
  const [premisesLimitError, setPremisesLimitError] = useState<string | null>(
    null
  );

  console.log("items search result : ", itemsSearchResults);

  useEffect(() => {
    // Prefetch items and premises on mount
    const fetchAll = async () => {
      try {
        // Always prefetch items from /api/items
        const items = await getItems();
        const itemsRes = items.data;
        // Try to support both {rows: [...]} and just array
        if (Array.isArray(itemsRes)) {
          setItemsData(itemsRes);
        } else if (Array.isArray(itemsRes.rows)) {
          setItemsData(itemsRes.rows);
        } else if (itemsRes.data && Array.isArray(itemsRes.data.rows)) {
          setItemsData(itemsRes.data.rows);
        } else {
          setItemsData([]);
        }
      } catch (e) {
        setItemsData([]);
      }
      try {
        const premisesRes = await getPremises();
        setPremisesData(premisesRes.data);
      } catch (e) {
        setPremisesData([]);
      }
    };
    fetchAll();
    // Reset premises selection state on first load
    setPremisesTouched(false);
    setSelectedPremises([]);
  }, []);

  // Reset premisesTouched when premisesSearchQuery changes (user is searching)
  useEffect(() => {
    setPremisesTouched(false);
  }, [premisesSearchQuery]);

  const handlePremisesSearch = async () => {
    if (!premisesSearchQuery.trim()) return;
    setPremisesSearchLoading(true);
    setPremisesSearchError(null);
    try {
      const data = await searchPremises(premisesSearchQuery);
      setPremisesSearchResults(data.data.rows || []);
    } catch (err: any) {
      setPremisesSearchError(
        "Premises search failed. Please try again. Error: " + err
      );
      setPremisesSearchResults([]);
    } finally {
      setPremisesSearchLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    setItemsSearchActive(true);
    try {
      const data = await searchItems(searchQuery);
      setItemsSearchResults(data.data.rows || []);
    } catch (err: any) {
      setSearchError("Search failed. Please try again.");
      setItemsSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Reset item search if searchQuery is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setItemsSearchActive(false);
      setItemsSearchResults([]);
    }
  }, [searchQuery]);

  const handleItemSelect = (item_code: number) => {
    setSelectedItem(item_code);
    setSelectedPremises([]);
    setShowComparison(false);
    setComparisonData(null);
    setComparisonError(null);
  };

  const handlePremiseToggle = (premise_code: number) => {
    setPremisesTouched(true);
    setPremisesLimitError(null);
    setSelectedPremises((prev) => {
      if (prev.includes(premise_code)) {
        // Remove from both arrays
        setSelectedPremisesDetails((details) =>
          details.filter((p) => p.premise_code !== premise_code)
        );
        return prev.filter((code) => code !== premise_code);
      } else if (prev.length >= 2) {
        setPremisesLimitError(
          "You can only select up to 2 premises for comparison."
        );
        return prev;
      } else {
        // Find premise details from any loaded data
        let premise = null;
        if (premisesSearchResults.length > 0) {
          premise = premisesSearchResults.find(
            (p) => p.premise_code === premise_code
          );
        }
        if (!premise && premisesData.length > 0) {
          premise = premisesData.find((p) => p.premise_code === premise_code);
        }
        if (premise) {
          setSelectedPremisesDetails((details) => {
            // Only add if not already present
            if (details.some((p) => p.premise_code === premise_code))
              return details;
            return [...details, premise];
          });
        }
        return [...prev, premise_code];
      }
    });
  };

  const startComparison = async () => {
    if (!selectedItem || selectedPremises.length < 2) return;
    setComparisonLoading(true);
    setComparisonError(null);
    try {
      const res = await calculateComparison(selectedItem, selectedPremises);
      setComparisonData(res.data);
      setShowComparison(true);
    } catch (err: any) {
      setComparisonError("Comparison failed. Please try again. Error: " + err);
    } finally {
      setComparisonLoading(false);
    }
  };

  const resetComparison = () => {
    setShowComparison(false);
    setComparisonData(null);
    setSelectedPremises([]);
    setComparisonError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">
                ValueVault
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
              {/* <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Track Products
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Compare Prices
              </a> */}
            </div>
            {/* <Button variant="outline" size="sm">
              Sign In
            </Button> */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Track Prices.
            <br />
            <span className="text-primary">Save Money.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-3 max-w-2xl mx-auto">
            Monitor product prices across Malaysian markets and supermarkets.
            Get the best deals on fresh goods and daily essentials.
          </p>
        </div>
      </section>

      {/* Tracked Items Section */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Tracked Items
            </h2>
            <p className="text-muted-foreground">
              Fresh goods and daily essentials across Malaysian markets
            </p>
          </div>
          {/* Item Search Bar (now part of Tracked Items) */}
          <div className="relative max-w-2xl mx-auto mb-10">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  placeholder="Search for items like 'Ayam Bersih', 'Beras', 'Sayur'..."
                  className="pl-10 h-12 text-base border-border focus:ring-2 focus:ring-accent"
                  disabled={searchLoading}
                />
              </div>
              <Button
                size="lg"
                className="h-12 px-8"
                onClick={handleSearch}
                disabled={searchLoading}
              >
                {searchLoading ? "Searching..." : "Track Price"}
              </Button>
            </div>
            {searchError && (
              <div className="text-red-600 text-sm mt-2">{searchError}</div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {itemsSearchActive && itemsSearchResults.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No items to display. Try searching above.
              </div>
            ) : Array.isArray(itemsData) && itemsData.length > 0 ? (
              (itemsSearchActive ? itemsSearchResults : itemsData).map(
                (item, index) => {
                  const isSelected = selectedItem === item.item_code;
                  return (
                    <Card
                      key={item.item_code || index}
                      className={`transition-all duration-200 cursor-pointer border-2 ${
                        isSelected
                          ? "border-primary bg-primary/10 scale-105 shadow-lg"
                          : "border-border hover:border-primary/60 hover:shadow"
                      } min-h-[120px] flex flex-col justify-between group`}
                      onClick={() => handleItemSelect(item.item_code)}
                      tabIndex={0}
                      aria-pressed={isSelected}
                    >
                      <CardHeader className="px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col gap-1">
                            <CardTitle className="text-base font-semibold flex items-center gap-1">
                              {isSelected && (
                                <Check className="h-4 w-4 text-green-500 animate-bounce" />
                              )}
                              <span className="max-w-[300px]" title={item.item}>
                                {item.item}
                              </span>
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                              Code: {item.item_code} • {item.unit}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant="outline"
                              className="mb-1 text-xs px-2 py-0.5"
                            >
                              {item.item_group}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.item_category}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 pt-0">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className={`flex-1 transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }`}
                            variant={isSelected ? "secondary" : "outline"}
                            tabIndex={-1}
                          >
                            {isSelected ? (
                              <>
                                <ArrowLeftRight className="h-4 w-4 mr-1" />
                                Selected
                              </>
                            ) : (
                              <>
                                <ArrowLeftRight className="h-4 w-4 mr-1" />
                                Compare
                              </>
                            )}
                          </Button>
                          {/* <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 text-xs"
                            tabIndex={-1}
                          >
                            <BarChart3 className="h-4 w-4 mr-1" />
                            History
                          </Button> */}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              )
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No items to display. Try searching above.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Premises Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Monitored Premises
            </h2>
            <p className="text-muted-foreground">
              {selectedItem
                ? "Select premises to compare prices"
                : "Markets and supermarkets where we track prices"}
            </p>
          </div>
          {/* Premises Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  value={premisesSearchQuery}
                  onChange={(e) => setPremisesSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePremisesSearch();
                  }}
                  placeholder="Search for premises, e.g. 'Tesco', 'Giant', 'Pasar'..."
                  className="pl-10 h-12 text-base border-border focus:ring-2 focus:ring-accent"
                  disabled={premisesSearchLoading}
                />
              </div>
              <Button
                size="lg"
                className="h-12 px-8"
                onClick={handlePremisesSearch}
                disabled={premisesSearchLoading}
              >
                {premisesSearchLoading ? "Searching..." : "Search Premises"}
              </Button>
            </div>
            {premisesSearchError && (
              <div className="text-red-600 text-sm mt-2">
                {premisesSearchError}
              </div>
            )}
          </div>
          {/* Show selected premises as badges */}
          {selectedPremises.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {selectedPremises.map((premise_code) => {
                const premise = selectedPremisesDetails.find(
                  (p) => p.premise_code === premise_code
                );
                if (!premise) return null;
                return (
                  <span
                    key={premise_code}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary gap-1"
                  >
                    <Store className="h-4 w-4 mr-1 text-primary" />
                    {premise.premise}
                  </span>
                );
              })}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(premisesSearchQuery && premisesSearchResults.length > 0
              ? premisesSearchResults
              : premisesData
            ).map((premise, index) => {
              return (
                <Card
                  key={premise.premise_code || index}
                  className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
                    selectedPremises.includes(premise.premise_code)
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={(e) => {
                    // Prevent selection if clicking View Price Data button
                    if (
                      (e.target as HTMLElement).closest(
                        "button[data-viewpricedata]"
                      ) !== null
                    )
                      return;
                    handlePremiseToggle(premise.premise_code);
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Store className="h-5 w-5 text-primary" />
                          {selectedPremises.includes(premise.premise_code) && (
                            <Check className="h-5 w-5 text-green-500" />
                          )}
                          {premise.premise}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Code: {premise.premise_code}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{premise.premise_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="text-sm text-muted-foreground">
                          {premise.address}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">State:</span>
                        <span className="font-medium">{premise.state}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">District:</span>
                        <span className="font-medium">{premise.district}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Button
                        size="sm"
                        variant={
                          selectedPremises.includes(premise.premise_code)
                            ? "default"
                            : "outline"
                        }
                        className="w-full sm:w-1/2"
                        disabled={!selectedItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePremiseToggle(premise.premise_code);
                        }}
                        aria-pressed={selectedPremises.includes(
                          premise.premise_code
                        )}
                      >
                        {selectedPremises.includes(premise.premise_code) ? (
                          <>
                            <Check className="h-4 w-4 mr-1" /> Selected
                          </>
                        ) : (
                          <>
                            <ArrowLeftRight className="h-4 w-4 mr-1" /> Select
                            for Comparison
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-1/2 bg-transparent border-dashed"
                        data-viewpricedata
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPriceData(premise);
                        }}
                        tabIndex={0}
                      >
                        <BarChart3 className="h-4 w-4 mr-1 text-primary" />
                        View Price Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Modal for viewing all tracked items at a premises */}
            {premisesLimitError && (
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm font-medium text-center w-full max-w-md">
                  {premisesLimitError}
                </div>
              </div>
            )}
            <Dialog
              open={viewPremisesModal.open}
              onOpenChange={closeViewPremisesModal}
            >
              <DialogContent className="max-w-2xl w-full">
                <DialogHeader>
                  <DialogTitle>
                    Price Data for {viewPremisesModal.premises?.premise}
                  </DialogTitle>
                  <DialogDescription>
                    {viewPremisesModal.premises?.address}
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto">
                  {premisesLatestLoading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : premisesLatestError ? (
                    <div className="text-center text-red-600 py-8">
                      {premisesLatestError}
                    </div>
                  ) : premisesLatestData && premisesLatestData.length > 0 ? (
                    <ItemsDataTable
                      data={premisesLatestData.map((row: any) => ({
                        item: row.items?.item,
                        item_code: row.items?.item_code,
                        unit: row.items?.unit,
                        item_group: row.items?.item_group,
                        item_category: row.items?.item_category,
                        price: row.items_premises?.price,
                        date: row.items_premises?.date,
                      }))}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No items to display.
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      {(selectedItem || showComparison) && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-accent/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
                <ArrowLeftRight className="h-8 w-8 text-primary" />
                Price Comparison
              </h2>
              <p className="text-muted-foreground">
                Compare prices across different premises
              </p>
            </div>
            {!showComparison ? (
              <div className="max-w-2xl mx-auto">
                <Card className="p-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-lg font-medium">
                      <Check className="h-5 w-5 text-green-500" />
                      Selected Item:{" "}
                      {
                        itemsData.find(
                          (item) => item.item_code === selectedItem
                        )?.item
                      }
                    </div>
                    <p className="text-muted-foreground">
                      Now select at least 2 premises to compare prices
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={startComparison}
                        disabled={
                          selectedPremises.length < 2 || comparisonLoading
                        }
                        className="px-8"
                      >
                        {comparisonLoading
                          ? "Comparing..."
                          : `Compare Prices (${selectedPremises.length}/2+)`}
                      </Button>
                      <Button variant="outline" onClick={resetComparison}>
                        Cancel
                      </Button>
                    </div>
                    {comparisonError && (
                      <div className="text-red-600 text-sm mt-2">
                        {comparisonError}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Show API-based comparison summary only */}
                {comparisonData ? (
                  <Card className="max-w-2xl mx-auto bg-accent/5">
                    <CardHeader>
                      <CardTitle className="text-center text-lg">
                        Price Comparison Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            RM {Number(comparisonData.lowestPrice).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Lowest Price
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            RM {Number(comparisonData.highestPrice).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Highest Price
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            RM {Number(comparisonData.averagePrice).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Average Price
                          </div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            RM {Number(comparisonData.maxDifference).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Max Difference
                          </div>
                        </div>
                      </div>
                      {comparisonData.bestDealpremise_code ? (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                          <div className="text-sm font-medium text-green-800 dark:text-green-200">
                            🎉{" "}
                            <span className="font-bold">Best Deal Alert!</span>{" "}
                            🎉 <br />
                            You can save up to{" "}
                            <span className="font-bold">
                              RM{" "}
                              {Number(comparisonData.maxDifference).toFixed(2)}
                            </span>{" "}
                            by buying at{" "}
                            <span className="font-bold underline">
                              {comparisonData.lowestPricePremise}
                            </span>{" "}
                            {
                              comparisonData.bestDealpremise_code.premises
                                .premise
                            }{" "}
                            <span className="font-bold">
                              with just RM{" "}
                              {Number(comparisonData.lowestPrice).toFixed(2)}
                            </span>
                            ! 🛍️💸
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg text-center">
                          <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            No significant price difference found between
                            selected premises.
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No comparison data.
                  </div>
                )}
                <div className="text-center">
                  <Button variant="outline" onClick={resetComparison}>
                    Start New Comparison
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      {/* <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose ValueVault?
            </h2>
            <p className="text-muted-foreground">
              Simple, powerful tools to help you save money on daily essentials
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Real-time Tracking
              </h3>
              <p className="text-muted-foreground">
                Monitor prices across Malaysian markets and supermarkets with
                daily updates.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Smart Alerts
              </h3>
              <p className="text-muted-foreground">
                Get notified when prices drop for fresh goods and daily
                essentials.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Price History
              </h3>
              <p className="text-muted-foreground">
                View detailed price trends to find the best times to shop.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">
                ValueVault
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 ValueVault. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
