import React from 'react';
import { FaTshirt, FaRunning, FaBrain, FaUsers, FaRegLightbulb } from 'react-icons/fa';
import { IoMdColorPalette } from 'react-icons/io';
import { RiTeamFill } from 'react-icons/ri';
import Navbar from '../components/Navbar/Navbar';

const AboutUs = () => {
  
  return (
  
     
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white duration-200 ">
      <Navbar />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
              <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Redefining Sportswear</span>
                    <span className="block text-indigo-600">Through Innovation</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    At SportWearXpress, we blend cutting-edge technology with premium sportswear to deliver personalized athletic apparel that enhances performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="Athlete in custom sportswear"
          />
        </div>
      </div>

      {/* Our Story */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Our Story</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              From Concept to Cutting-Edge
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Founded in 2023 by a team of athletes and tech enthusiasts, SportWearXpress was born from a simple idea: sportswear should be as unique as the athletes who wear it.
            </p>
          </div>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-lg font-medium text-gray-900">
                  Our Journey
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <FaRegLightbulb className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">The Idea</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Recognizing the gap in personalized athletic wear, our founders set out to create a platform that combines customization with performance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <FaBrain className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">AI Integration</h3>
                    <p className="mt-5 text-base text-gray-500">
                      We pioneered the use of AI in sportswear design, creating intelligent tools that help athletes visualize their perfect gear.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <FaUsers className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Community Growth</h3>
                    <p className="mt-5 text-base text-gray-500">
                      From our first 100 customers to serving athletes worldwide, we've built a community that values both performance and personal expression.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What Makes Us Unique */}
      <div className="relative bg-gray-900 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="text-base font-semibold uppercase tracking-wider text-indigo-300">Innovation</h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Why SportWearXpress Stands Out
          </p>
          <p className="mx-auto mt-5 max-w-prose text-xl text-gray-300">
            We're not just another sportswear brand. Here's what sets us apart:
          </p>
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <IoMdColorPalette className="h-8 w-8 text-indigo-400" />,
                  title: "Unlimited Customization",
                  description: "Our AI-powered design studio offers endless possibilities for personalization."
                },
                {
                  icon: <FaRunning className="h-8 w-8 text-indigo-400" />,
                  title: "Performance First",
                  description: "Every design is engineered to enhance athletic performance, not just look good."
                },
                {
                  icon: <FaTshirt className="h-8 w-8 text-indigo-400" />,
                  title: "Premium Materials",
                  description: "We use only the highest quality fabrics that stand up to intense training."
                },
                {
                  icon: <FaBrain className="h-8 w-8 text-indigo-400" />,
                  title: "Smart Recommendations",
                  description: "Our AI learns your preferences to suggest perfect designs for your sport."
                },
                {
                  icon: <RiTeamFill className="h-8 w-8 text-indigo-400" />,
                  title: "Team Collaboration",
                  description: "Special tools for teams to design matching gear with individual touches."
                },
                {
                  icon: <FaRegLightbulb className="h-8 w-8 text-indigo-400" />,
                  title: "Sustainable Innovation",
                  description: "Eco-friendly materials and processes without compromising performance."
                }
              ].map((feature, index) => (
                <div key={index} className="pt-6">
                  <div className="flow-root bg-gray-800 rounded-lg px-6 pb-8 h-full">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-gray-700 rounded-md shadow-lg">
                          {feature.icon}
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-white tracking-tight">{feature.title}</h3>
                      <p className="mt-5 text-base text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Our Team</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              The Minds Behind the Innovation
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "M Awais Akram",
                role: "Tech Lead & AI Specialist",
                bio: "Architect of our AI customization engine with a passion for machine learning applications in fashion.",
                img: "https://randomuser.me/api/portraits/men/32.jpg"
              },
              {
                name: "Muhammad Muneeb Butt",
                role: "Frontend Architect",
                bio: "Crafts the seamless user experiences that make customization intuitive and enjoyable.",
                img: "https://randomuser.me/api/portraits/men/22.jpg"
              },
              {
                name: "Muhammad Qasim Abbas",
                role: "Backend Systems",
                bio: "Ensures our platform runs smoothly at scale, handling thousands of custom designs daily.",
                img: "https://randomuser.me/api/portraits/men/19.jpg"
              }
            ].map((member, index) => (
              <div key={index} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                <div className="flex-shrink-0">
                  <img className="h-48 w-full object-cover" src={member.img} alt={member.name} />
                </div>
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-600">
                      {member.role}
                    </p>
                    <div className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">{member.name}</p>
                      <p className="mt-3 text-base text-gray-500">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to design your perfect sportswear?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Experience the future of athletic apparel with our AI-powered customization platform.
          </p>
          <a
            href="/Product"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
          >
            Start Designing Now
          </a>
        </div>
      </div>
    </div>
    
  );
};

export default AboutUs;