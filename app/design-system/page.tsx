'use client';

import { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Badge,
  ProgressBar,
  Modal,
  Timer
} from '@/components/ui';
import {
  AnimatedBackground,
  PageContainer,
  NavBar
} from '@/components/layout';

/**
 * Design System Showcase Page
 * Demonstrates all UI components with interactive examples
 */
export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [progressValue, setProgressValue] = useState(75);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length < 3 && value.length > 0) {
      setInputError('Must be at least 3 characters');
    } else {
      setInputError('');
    }
  };

  return (
    <>
      <AnimatedBackground />
      <NavBar user={{ name: "Demo User", username: "demo" }} />

      <PageContainer maxWidth="2xl">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              Axon Overclocking Design System
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              A comprehensive glassmorphism design system built with Next.js 15, TypeScript, and Tailwind CSS
            </p>
          </div>

          {/* Color Palette */}
          <section>
            <Card>
              <h2 className="text-3xl font-bold text-white mb-6">Color Palette</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-24 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg"></div>
                  <p className="text-sm text-white font-medium">Primary Gradient</p>
                  <p className="text-xs text-white/60">#667eea → #764ba2</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-xl bg-green-500 shadow-lg"></div>
                  <p className="text-sm text-white font-medium">Success / Correct</p>
                  <p className="text-xs text-white/60">#10b981</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-xl bg-yellow-500 shadow-lg"></div>
                  <p className="text-sm text-white font-medium">Warning / Missed</p>
                  <p className="text-xs text-white/60">#f59e0b</p>
                </div>
                <div className="space-y-2">
                  <div className="h-24 rounded-xl bg-red-500 shadow-lg"></div>
                  <p className="text-sm text-white font-medium">Error / Incorrect</p>
                  <p className="text-xs text-white/60">#ef4444</p>
                </div>
              </div>
            </Card>
          </section>

          {/* Cards */}
          <section>
            <Card>
              <h2 className="text-3xl font-bold text-white mb-6">Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card blur="sm" hover={true}>
                  <h3 className="text-lg font-bold text-white mb-2">Light Blur</h3>
                  <p className="text-white/70 text-sm">Card with backdrop-blur-sm</p>
                </Card>
                <Card blur="md" hover={true}>
                  <h3 className="text-lg font-bold text-white mb-2">Medium Blur</h3>
                  <p className="text-white/70 text-sm">Card with backdrop-blur-md</p>
                </Card>
                <Card blur="lg" hover={true}>
                  <h3 className="text-lg font-bold text-white mb-2">Heavy Blur</h3>
                  <p className="text-white/70 text-sm">Card with backdrop-blur-lg</p>
                </Card>
              </div>
            </Card>
          </section>

          {/* Buttons */}
          <section>
            <Card>
              <h2 className="text-3xl font-bold text-white mb-6">Buttons</h2>

              <div className="space-y-6">
                {/* Variants */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Variants</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="primary" disabled>Disabled</Button>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Sizes</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Inputs */}
          <section>
            <Card>
              <h2 className="text-3xl font-bold text-white mb-6">Inputs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Username"
                  placeholder="Enter username"
                  value={inputValue}
                  onChange={handleInputChange}
                  error={inputError}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="user@example.com"
                  helperText="We'll never share your email"
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                />
                <Input
                  label="Disabled Input"
                  placeholder="Cannot edit"
                  disabled
                  value="Disabled"
                />
              </div>
            </Card>
          </section>

          {/* Badges */}
          <section>
            <Card>
              <h2 className="text-3xl font-bold text-white mb-6">Badges</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Variants</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="success">Correct</Badge>
                    <Badge variant="error">Incorrect</Badge>
                    <Badge variant="warning">Missed</Badge>
                    <Badge variant="info">Info</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Sizes</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge size="sm">Small</Badge>
                    <Badge size="md">Medium</Badge>
                    <Badge size="lg">Large</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Progress Bars */}
          <section>
            <Card>
              <h2 className="text-3xl font-bold text-white mb-6">Progress Bars</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-white/80 mb-2">Default (75%)</h3>
                  <ProgressBar value={progressValue} max={100} variant="default" showLabel animated />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/80 mb-2">Success (90%)</h3>
                  <ProgressBar value={90} max={100} variant="success" animated />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/80 mb-2">Warning (50%)</h3>
                  <ProgressBar value={50} max={100} variant="warning" animated />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/80 mb-2">Danger (25%)</h3>
                  <ProgressBar value={25} max={100} variant="danger" animated />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>
                    Decrease
                  </Button>
                  <Button size="sm" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>
                    Increase
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          {/* Timer */}
          <section>
            <Card>
              <h2 className="text-3xl font-bold text-white mb-6">Timer</h2>
              <div className="flex justify-center">
                <Timer
                  seconds={60}
                  onComplete={() => console.log('Timer completed!')}
                  size="lg"
                />
              </div>
              <p className="text-center text-white/60 text-sm mt-4">
                Timer changes color as time runs out: Green → Yellow → Red
              </p>
            </Card>
          </section>

          {/* Modal */}
          <section>
            <Card>
              <h2 className="text-3xl font-bold text-white mb-6">Modal</h2>
              <Button onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Example Modal"
                size="md"
              >
                <div className="space-y-4">
                  <p className="text-white/80">
                    This is a modal dialog with glassmorphism styling. It includes:
                  </p>
                  <ul className="list-disc list-inside text-white/70 space-y-1">
                    <li>Backdrop blur overlay</li>
                    <li>ESC key to close</li>
                    <li>Click outside to close</li>
                    <li>Smooth animations</li>
                    <li>Accessible ARIA attributes</li>
                  </ul>
                  <div className="flex gap-2 pt-4">
                    <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                      Confirm
                    </Button>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Modal>
            </Card>
          </section>

          {/* Typography */}
          <section>
            <Card>
              <h2 className="text-3xl font-bold text-white mb-6">Typography</h2>
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-white">Heading 1 - 4xl</h1>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Heading 2 - 3xl</h2>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Heading 3 - 2xl</h3>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Heading 4 - xl</h4>
                </div>
                <div>
                  <p className="text-base text-white">Body text - base</p>
                </div>
                <div>
                  <p className="text-sm text-white/80">Small text - sm</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Extra small text - xs</p>
                </div>
              </div>
            </Card>
          </section>

          {/* Example: Training Card */}
          <section>
            <Card>
              <h2 className="text-3xl font-bold text-white mb-6">Example: Training Card</h2>
              <Card blur="lg" hover={true}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Word Memory</h3>
                    <p className="text-white/70">Memorize as many words as possible</p>
                  </div>
                  <Badge variant="success">Easy</Badge>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-white">15</div>
                      <div className="text-sm text-white/60">Sessions</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-400">85%</div>
                      <div className="text-sm text-white/60">Avg Score</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-purple-400">12</div>
                      <div className="text-sm text-white/60">Streak</div>
                    </div>
                  </div>

                  <ProgressBar value={85} max={100} variant="success" showLabel />

                  <Button variant="primary" className="w-full" size="lg">
                    Start Training
                  </Button>
                </div>
              </Card>
            </Card>
          </section>

          {/* Code Examples */}
          <section>
            <Card>
              <h2 className="text-3xl font-bold text-white mb-6">Quick Start</h2>
              <div className="space-y-4">
                <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-white/90">
                    <code>{`// Import components
import { Card, Button, Input } from '@/components/ui';
import { PageContainer, NavBar } from '@/components/layout';

// Use in your components
<Card blur="md">
  <h2>Card Title</h2>
  <Button variant="primary">Click Me</Button>
</Card>`}</code>
                  </pre>
                </div>
                <p className="text-white/70 text-sm">
                  See <code className="bg-white/10 px-2 py-1 rounded">components/ui/README.md</code> for complete documentation.
                </p>
              </div>
            </Card>
          </section>

          {/* Footer */}
          <div className="text-center py-8">
            <p className="text-white/60">
              Built with Next.js 15, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
