import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Brain, Eye, Shield, Zap, BarChart3 } from "lucide-react";
import Link from "next/link";


export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-sky-100 text-sky-700 hover:bg-sky-100">
            <Brain className="w-4 h-4 mr-1" />
            AI-Powered Monitoring
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Intelligent Log Monitoring
            <span className="block text-sky-500">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Monitor your application uptime and analyze logs with AI-powered insights. 
            Integrated with Loki for comprehensive log management and real-time alerting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-sky-200 text-sky-600 hover:bg-sky-50 px-8 py-3">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to monitor your applications
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive monitoring solution with AI-powered insights and seamless integration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-sky-100 hover:border-sky-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Monitor className="w-6 h-6 text-sky-500" />
                </div>
                <CardTitle className="text-gray-900">Uptime Monitoring</CardTitle>
                <CardDescription>
                  24/7 monitoring of your application availability with instant alerts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-sky-100 hover:border-sky-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-sky-500" />
                </div>
                <CardTitle className="text-gray-900">AI Log Analysis</CardTitle>
                <CardDescription>
                  Intelligent pattern recognition and anomaly detection in your logs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-sky-100 hover:border-sky-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-sky-500" />
                </div>
                <CardTitle className="text-gray-900">Loki Integration</CardTitle>
                <CardDescription>
                  Seamless integration with Grafana Loki for scalable log aggregation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-sky-100 hover:border-sky-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-sky-500" />
                </div>
                <CardTitle className="text-gray-900">Real-time Alerts</CardTitle>
                <CardDescription>
                  Instant notifications via email, Slack, or webhook integrations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-sky-100 hover:border-sky-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-sky-500" />
                </div>
                <CardTitle className="text-gray-900">Analytics Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive insights and metrics with customizable dashboards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-sky-100 hover:border-sky-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-sky-500" />
                </div>
                <CardTitle className="text-gray-900">Security First</CardTitle>
                <CardDescription>
                  Enterprise-grade security with encrypted data transmission and storage
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-sky-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to monitor smarter?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of developers who trust LogWatch AI for their monitoring needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-sky-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-blue-800 rounded flex items-center justify-center">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">LogWatch AI</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-sky-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-sky-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-sky-600 transition-colors">Support</a>
            </div>
          </div>
          <div className="border-t border-sky-100 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2025 LogWatch AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}