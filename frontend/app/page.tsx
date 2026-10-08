'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarContext';
import SidebarCard from '@/components/SidebarCard';
import ProductItem from '@/components/ProductItem';
import FeatureCard from '@/components/FeatureCard';
import { Shield, Activity, Network, Box, ExternalLink, PlayCircle, Menu, ChevronRight } from 'lucide-react';

export default function Home() {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          credentials: 'include',
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          router.push('/signin');
        }
      } catch (error) {
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#161d27] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#161d27] flex flex-col font-sans">
      <TopNav />

      {/* Breadcrumb Bar */}
      <div className="h-10 border-b border-[#2c384a] flex items-center px-4 w-full bg-[#161d27] text-[13px]">
        <button onClick={toggleSidebar} className="text-[#3ea1fc] bg-[#3ea1fc]/10 p-1 rounded hover:bg-[#3ea1fc]/20 mr-4 transition-colors">
          <Menu size={18} />
        </button>
        <span className="text-[#3ea1fc] cursor-pointer hover:underline font-bold" onClick={() => router.push('/')}>Route 53</span>
        <ChevronRight size={14} className="mx-2 text-gray-500" />
        <span className="text-gray-400">Dashboard</span>
      </div>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full max-w-[1200px] mx-auto px-6 py-8">

          {/* Header Section */}
          <div className="mb-10">
            <p className="text-cs-text-link text-sm mb-2 hover:underline cursor-pointer">Network &amp; Content Delivery</p>
            <h1 className="text-white text-3xl font-bold mb-2 tracking-tight">Amazon Route 53</h1>
            <h2 className="text-white text-2xl mb-4 font-light">A reliable way to route users to internet applications</h2>
            <p className="text-white text-sm max-w-3xl">
              Amazon Route 53 is a highly available and scalable cloud Domain Name System (DNS) web service.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left Column (Main Content) */}
            <div className="flex-1 flex flex-col gap-10">


              {/* Products */}
              <section>
                <h3 className="text-white text-xl font-bold mb-4">Products</h3>
                <div className="bg-cs-bg-container border border-[#2c384a] rounded-lg px-6 py-2">
                  <ProductItem
                    icon={<Network size={32} className="text-white" />}
                    title="Hosted zones"
                    description="Specify how you want Route 53 to respond to DNS queries for a domain such as example.com."
                  />
                  <ProductItem
                    icon={<Activity size={32} className="text-cs-text-link" />}
                    title="Health checks"
                    description="Monitor your applications and web resources, and direct DNS queries to healthy resources."
                  />
                  <ProductItem
                    icon={<Box size={32} className="text-white" />}
                    title="Traffic flow"
                    description="Use a visual tool to create policies for multiple endpoints in complex configurations."
                  />
                  <ProductItem
                    icon={<Shield size={32} className="text-white" />}
                    title="Resolver"
                    description="Route DNS queries between your VPCs and your network."
                  />
                </div>
              </section>

              {/* Benefits and features */}
              <section>
                <h3 className="text-white text-xl font-bold mb-4">Benefits and features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FeatureCard
                    title="Highly available and reliable"
                    description="Amazon Route 53 is built using AWS's highly available and reliable infrastructure. Our distributed DNS servers ensure that you can consistently route your end users to your application."
                  />
                  <FeatureCard
                    title="Designed for use with other AWS services"
                    description="You can use Amazon Route 53 to map domain names to your Amazon EC2 instances, Amazon S3 buckets, Amazon CloudFront distributions, and other AWS resources."
                  />
                  <FeatureCard
                    title="Simple"
                    description="You can quickly sign up, and Amazon Route 53 can start to answer your DNS queries within minutes."
                  />
                  <FeatureCard
                    title="Flexible"
                    description="Amazon Route 53 routes traffic based on multiple criteria, such as endpoint health, geographic location, and latency."
                  />
                </div>
              </section>

              {/* Use cases */}
              <section>
                <h3 className="text-white text-xl font-bold mb-4">Use cases</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FeatureCard
                    title="Global traffic management"
                    description={
                      <>
                        Route 53 Traffic Flow helps you construct sophisticated routing configurations for resources in multiple AWS and non-AWS locations. <a href="#" className="text-[#3ea1fc] hover:underline inline-flex items-center gap-1">Learn more <ExternalLink size={12} /></a>
                      </>
                    }
                  />
                  <FeatureCard
                    title="Alias to AWS resources"
                    description={
                      <>
                        You can use Route 53 alias records to map your zone apex (such as example.com) or a subdomain to selected AWS resources. For example, you can route traffic to ELB load balancers, CloudFront distributions, or S3 buckets configured as website endpoints. <a href="#" className="text-[#3ea1fc] hover:underline inline-flex items-center gap-1">Learn more <ExternalLink size={12} /></a>
                      </>
                    }
                  />
                </div>
              </section>

              {/* Related services */}
              <section>
                <h3 className="text-white text-xl font-bold mb-4">Related services</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FeatureCard
                    title="Amazon CloudFront"
                    description={
                      <>
                        To speed up delivery of your web content, you can use Amazon CloudFront, the AWS content delivery network (CDN). CloudFront can deliver your entire website—including dynamic, static, streaming, and interactive content—by using a global network of edge locations. <a href="#" className="text-[#3ea1fc] hover:underline inline-flex items-center gap-1">Learn more <ExternalLink size={12} /></a>
                      </>
                    }
                  />
                  <FeatureCard
                    title="Amazon CloudWatch"
                    description={
                      <>
                        You can use Amazon CloudWatch to monitor the status—healthy or unhealthy—of your Route 53 health checks, and get notifications when the status changes. <a href="#" className="text-[#3ea1fc] hover:underline inline-flex items-center gap-1">Learn more <ExternalLink size={12} /></a>
                      </>
                    }
                  />
                </div>
              </section>
            </div>

            {/* Right Column (Sidebar Widgets) */}
            <div className="w-full lg:w-[320px] flex flex-col gap-4">

              <SidebarCard title="Get started with Route 53">
                <p className="mb-4 text-white">Get started by registering a domain, configuring DNS, or using another Route 53 feature.</p>
                <button onClick={() => router.push('/get-started')} className="bg-[#ff9900] hover:bg-[#ec7211] text-black font-bold py-1.5 px-4 rounded-full text-sm transition-colors w-fit border border-transparent shadow-sm">
                  Get started
                </button>
              </SidebarCard>

              <SidebarCard title="Pricing (US)">
                <a href="#" className="text-[#3ea1fc] hover:underline flex items-center gap-1 w-fit">
                  View pricing <ExternalLink size={12} />
                </a>
              </SidebarCard>

              <SidebarCard title="More resources" titleIcon={<ExternalLink size={14} className="ml-1 opacity-70" />}>
                <div className="flex flex-col">
                  <a href="#" className="py-2.5 border-b border-[#2c384a] text-[#3ea1fc] hover:underline text-[13px]">Documentation</a>
                  <a href="#" className="py-2.5 border-b border-[#2c384a] text-[#3ea1fc] hover:underline text-[13px]">API reference</a>
                  <a href="#" className="py-2.5 border-b border-[#2c384a] text-[#3ea1fc] hover:underline text-[13px]">FAQs</a>
                  <a href="#" className="py-2.5 border-b border-[#2c384a] text-[#3ea1fc] hover:underline text-[13px]">Forum - DNS and health checks</a>
                  <a href="#" className="py-2.5 text-[#3ea1fc] hover:underline text-[13px]">Forum - Domain name registration</a>
                </div>
              </SidebarCard>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
