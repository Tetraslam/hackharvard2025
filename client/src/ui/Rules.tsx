import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { useGameStore } from "@/game/store";

export function Rules() {
  const { setCurrentView } = useGameStore();

  const handleExit = () => {
    setCurrentView("menu");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 md:p-8">
      {/* Exit button */}
      <Button
        onClick={handleExit}
        variant="outline"
        className="absolute top-6 right-6 z-20"
      >
        Exit to Main Menu
      </Button>

      <div className="relative z-10 w-full max-w-6xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold retro leading-[1.8]">
            FIREBALL Rules
          </h1>
          <p className="text-lg text-muted-foreground leading-[2.5]">
            Master the art of gesture-based wizard combat
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* The 7 Moves */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl retro text-center">
                The 7 Moves
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <div className="font-bold text-lg">Fireball</div>
                    <div className="text-sm text-muted-foreground">Kamehameha pose</div>
                  </div>
                  <div className="text-lg font-bold text-red-500">15 dmg</div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <div className="font-bold text-lg">Water Blast</div>
                    <div className="text-sm text-muted-foreground">Arms crossed → sweep</div>
                  </div>
                  <div className="text-lg font-bold text-blue-500">12 dmg</div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <div className="font-bold text-lg">Lightning</div>
                    <div className="text-sm text-muted-foreground">One arm up, one forward</div>
                  </div>
                  <div className="text-lg font-bold text-yellow-500">20 dmg</div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <div className="font-bold text-lg">Shield</div>
                    <div className="text-sm text-muted-foreground">Boxing stance</div>
                  </div>
                  <div className="text-lg font-bold text-gray-500">Blocks</div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <div className="font-bold text-lg">Counter</div>
                    <div className="text-sm text-muted-foreground">Cross-block → open</div>
                  </div>
                  <div className="text-lg font-bold text-orange-500">10 dmg</div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <div className="font-bold text-lg">Meteor</div>
                    <div className="text-sm text-muted-foreground">Arms up → slam down</div>
                  </div>
                  <div className="text-lg font-bold text-purple-500">25 dmg</div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <div className="font-bold text-lg">Job Application</div>
                    <div className="text-sm text-muted-foreground">Prayer hands</div>
                  </div>
                  <div className="text-lg font-bold text-green-500">10 dmg</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl retro text-center">
                Game Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded">
                  <div className="font-bold text-lg mb-2">Objective</div>
                  <div className="text-sm">Best of 3 rounds wins the game</div>
                </div>
                
                <div className="p-3 bg-muted rounded">
                  <div className="font-bold text-lg mb-2">Move Interactions</div>
                  <div className="text-sm space-y-1">
                    <div>• Fireball cancels Water Blast</div>
                    <div>• Shield blocks next attack</div>
                    <div>• Counter breaks shield + bonus damage</div>
                    <div>• Lightning stuns opponent (2s)</div>
                  </div>
                </div>
                
                <div className="p-3 bg-muted rounded">
                  <div className="font-bold text-lg mb-2">Special Rules</div>
                  <div className="text-sm space-y-1">
                    <div>• Meteor can't be blocked</div>
                    <div>• All attacks auto-hit unless blocked</div>
                    <div>• Use your camera to detect gestures</div>
                    <div>• Stand 3-6 feet from your camera</div>
                  </div>
                </div>
                
                <div className="p-3 bg-muted rounded">
                  <div className="font-bold text-lg mb-2">Tips</div>
                  <div className="text-sm space-y-1">
                    <div>• Make gestures clear and deliberate</div>
                    <div>• Hold poses for 1-2 seconds</div>
                    <div>• Good lighting helps detection</div>
                    <div>• Have fun and be dramatic!</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
