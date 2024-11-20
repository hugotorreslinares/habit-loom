import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

const RandomQuote: React.FC = () => {
  const [quote, setQuote] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const fetchRandomQuote = async () => {
    try {
      const response = await fetch("https://api.quotable.io/random");
      const data = await response.json();
      setQuote(data.content);
    } catch (error) {
      console.error("Error fetching quote:", error);
    }
  };

  useEffect(() => {
    fetchRandomQuote();
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <Card className="max-w-sm mx-auto mt-10">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center">
          Inspiration
          <button onClick={toggleVisibility} className="ml-2 focus:outline-none">
            {isVisible ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </CardTitle>
      </CardHeader>
      {isVisible && (
        <CardContent className="text-center">
          <p className="text-lg mb-4">{quote}</p>
          <Button onClick={fetchRandomQuote} variant="secondary">
            Get Inspired
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default RandomQuote;