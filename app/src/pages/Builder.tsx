import React from "react";
import { useLocation } from "react-router-dom";

export function Builder() {
  const location = useLocation();

  return (
    <p className="mt-8 text-gray-300">
      This is where the magic will happen. Stay tuned for your generated
      website!
    </p>
  );
}
