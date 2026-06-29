import React from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

const ServiceFeeDetails = ({ isOpen, onClose, displayItem }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Service Type Details"
            size="sm"
        >
            {displayItem && (
                <>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div className="col-span-2 sm:col-span-1">
                            <dt className="text-gray-500 font-medium">Service Name</dt>
                            <dd className="font-semibold text-gray-900 mt-0.5 break-words">
                                {displayItem.serviceName}
                            </dd>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <dt className="text-gray-500 font-medium">Base Amount</dt>
                            <dd className="font-bold text-gray-800 mt-0.5">
                                ₹{Number(displayItem.baseAmount).toLocaleString("en-IN")}
                            </dd>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <dt className="text-gray-500 font-medium">Tax Rate</dt>
                            <dd className="font-semibold text-gray-900 mt-0.5">
                                {displayItem.taxRate}%
                            </dd>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <dt className="text-gray-500 font-medium">Discount Allowed</dt>
                            <dd className="font-semibold text-gray-900 mt-0.5">
                                {displayItem.discountAllowed ? "Yes" : "No"}
                            </dd>
                        </div>

                        {displayItem.discountAllowed && (
                            <div className="col-span-2">
                                <dt className="text-gray-500 font-medium">Coupon Code</dt>
                                <dd className="font-mono font-semibold text-gray-900 mt-0.5">
                                    {displayItem.couponCode || "—"}
                                </dd>
                            </div>
                        )}

                        <div className="col-span-2 sm:col-span-1">
                            <dt className="text-gray-500 font-medium">Status</dt>
                            <dd
                                className={`font-semibold text-xs mt-0.5 px-3 py-1 inline-block rounded-full border
                  ${displayItem.status === "ACTIVE"
                                        ? "text-green-700 bg-green-50 border-green-700"
                                        : "text-red-700 bg-red-50 border-red-700"
                                    }`}
                            >
                                {displayItem.status}
                            </dd>
                        </div>
                    </dl>
                    <div className="my-2 flex justify-end">
                        <div>
                            <Button variant="outline" size="sm" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default ServiceFeeDetails;