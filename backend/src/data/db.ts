import { Article, VideoReport, Submission, UserProfile, NotificationItem, SponsoredBanner, CategoryItem, UserRole } from '../types';

export class DataStore {
  public users: UserProfile[] = [
    {
      id: 'user_admin',
      name: 'Dr. Alexander Vance',
      email: 'admin@nexttruth.media',
      password: 'admin123',
      role: 'ADMIN',
      roleBadge: 'CHIEF EDITOR',
      bio: 'Editorial Director & Systems Lead overseeing Next Truth global ground reporting networks.',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOgsVe1TMEQYu6j8BJIoL6LpMDoVlYH2A3ghSX1CDzkIb7QCq4uCi6IjE5Lt1IQb0ahhFTP1YgX4wlfsSjGYDcuDE9Vx05-LmgLiuHyBTha74sYtP7IXfciPNvdHN10BkugGpCbnh4LUv9E2JzbBh2gbXlkM3AiKq4XbQ3bJoE7aq1EHcTOXytVKt_DRvySr8Hn_jb09-_6dMrjtG69qZeT1WhJQIxwK2SHE0FHHNpoFmEgUtKR8oAWA',
      isPremium: true,
      publishedCount: 42,
      totalViews: '520k',
      bookmarkedArticleIds: ['hero_1', 'op_1'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_journalist',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@nexttruth.media',
      password: 'journalist123',
      role: 'JOURNALIST',
      roleBadge: 'STAFF JOURNALIST',
      bio: 'Senior Political and Tech Correspondent investigating algorithmic policy and civic infrastructure.',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo2Zm8gfuBOIlL0oF01pJcZp_AO0LscocecKRW7B0I314yqz_PyLzzsChtSW4TMvEqUv6dLdMhgv0MJfDprQnVj0Wh2v5SNxq3MAHs_ObQ4GLeMfABdEzTKqvYD8cQ2r0kCzNLbvflG1lEFgdqCHO5XKKi6r9yN1EjAN8C_6i2xHdc3NXjK5PrqpvSPzdonO9hDQprub7leLDNzO-1DkaczxbPE86j5mQcah6dbedRIb5Pz-kekrQJCA',
      isPremium: true,
      publishedCount: 28,
      totalViews: '310k',
      bookmarkedArticleIds: ['prem_col_1'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_expert',
      name: 'Elias Thorne',
      email: 'elias.thorne@nexttruth.media',
      password: 'expert123',
      role: 'EXPERT',
      roleBadge: 'GROUND EXPERT',
      bio: 'Independent investigative reporter and infrastructure policy researcher.',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByJne4Qwb-P_F0TU4UfX9xzAvqDm3Nlyhd__LQkUAzHvVbrWdeM-eyCU7rDdmkjNROjSE017nAoagBS5p7XsGXwdDf-o9ezd-oEBOguBVOuR1kmAgwcRxZwgPqSOYRRN6DjnHnhm_kl203eHMM58OLlsjwEhP5Jf7lt-MqiSxnx6F3tU4H7qrJsA05l_FOkCfThzR3UMoprtysOJlrP6iqok6QYPoVTC6ZErCUm4L4qywn3VopvOWQxA',
      isPremium: false,
      publishedCount: 14,
      totalViews: '184k',
      bookmarkedArticleIds: ['hero_1'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_citizen',
      name: 'Rohan Sharma',
      email: 'citizen@nexttruth.media',
      password: 'citizen123',
      role: 'USER',
      roleBadge: 'CITIZEN REPORTER',
      bio: 'Local community delegate and active eyewitness reporter in District 4.',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120',
      isPremium: false,
      publishedCount: 3,
      totalViews: '8.2k',
      bookmarkedArticleIds: [],
      createdAt: new Date().toISOString(),
    },
  ];

  public activeUserId: string = 'guest_user';

  public guestProfile: UserProfile = {
    id: 'guest_user',
    name: 'Guest',
    email: '',
    role: 'USER',
    roleBadge: 'GUEST',
    bio: '',
    avatarUrl: '',
    isPremium: false,
    publishedCount: 0,
    totalViews: '0',
    bookmarkedArticleIds: [],
    likedVideoIds: [],
    createdAt: new Date().toISOString(),
  };

  public get userProfile(): UserProfile {
    if (this.activeUserId === 'guest_user' || this.activeUserId === 'guest' || !this.activeUserId) {
      return this.guestProfile;
    }
    return this.users.find((u) => u.id === this.activeUserId) || this.guestProfile;
  }

  public set userProfile(profile: UserProfile) {
    if (profile.id === 'guest_user' || profile.id === 'guest') {
      this.guestProfile = profile;
      return;
    }
    const idx = this.users.findIndex((u) => u.id === profile.id);
    if (idx >= 0) {
      this.users[idx] = profile;
    } else {
      this.users.push(profile);
    }
  }

  public articles: Article[] = [
    {
      id: 'hero_1',
      title: 'City Council Votes Overwhelmingly to Restructure Municipal Zones Amidst Pushback',
      excerpt: 'In an unprecedented evening session marked by vocal disruptions from the gallery, the council passed the controversial zoning ordinance. Our reporters on the floor confirm immediate logistical shifts.',
      fullContent: `In an unprecedented evening session marked by vocal disruptions from the gallery, the city council passed the controversial zoning ordinance by an 8-2 margin. 

Our reporters embedded directly inside the municipal chamber confirmed that the session extended past midnight as community delegates staged a peaceful walkout during the final clause deliberations.

Key Takeaways from Tonight's Chamber Session:
• High-density commercial corridors are now authorized across historic residential sectors in Districts 3 and 7.
• Emergency funding has been reallocated from localized heritage preservation to commercial arterial maintenance.
• Citizen coalitions have filed an immediate injunction petition alleging procedural discrepancies during public commentary windows.

"We are witnessing an unprecedented realignment of public space prioritizing commercial speculation over civic heritage," voiced Council Member Alvarez in an impassioned dissenting statement.

Next Truth verification analysts have cross-referenced land deeds and municipal campaign contributions, revealing active developer filings predating the official legislative proposal by six months. Continuous ground updates will follow as community assemblies convene tomorrow morning.`,
      authorName: 'Sarah Jenkins',
      authorTitle: 'Senior Political Correspondent',
      authorAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo2Zm8gfuBOIlL0oF01pJcZp_AO0LscocecKRW7B0I314yqz_PyLzzsChtSW4TMvEqUv6dLdMhgv0MJfDprQnVj0Wh2v5SNxq3MAHs_ObQ4GLeMfABdEzTKqvYD8cQ2r0kCzNLbvflG1lEFgdqCHO5XKKi6r9yN1EjAN8C_6i2xHdc3NXjK5PrqpvSPzdonO9hDQprub7leLDNzO-1DkaczxbPE86j5mQcah6dbedRIb5Pz-kekrQJCA',
      dateOrTimeAgo: '14 mins ago',
      category: 'Urgent Report',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqLT6_xuXsEgt28zf4OpocWlIUMdiG3L_mjr7RlIDDckEyESxzWOIlMrwsbwwYhRr_06Pwt5pPEdOQXHkLlG_DnieMvhHmOpXqYQ4R_od9i8ei1UtSHs4TGm8sow2155seVqNzdVUGxrCG6gqDJnq4xIseqkBGgfJdCrylDTr4sgyHUZuZ5ppsCNA9ZFA7GwSRyEZXqm2sAoZi0xx3bjlwKJeieev7z5OOc56kdsCXlWgtd1nApcXWRw',
      isVerifiedGround: true,
      isUrgent: true,
      isHero: true,
      readTime: '4 min read',
      views: '34.2k',
      viewCount: 34200,
      categoryTag: 'MUNICIPAL',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'op_1',
      title: 'The Silent Cost of Urban Expansion Must Be Audited',
      excerpt: 'We are sacrificing historical continuity for transient economic gains. The recent council decisions ignore the fundamental fabric of our community neighborhoods.',
      fullContent: `We are sacrificing historical continuity for transient economic gains. The recent council decisions ignore the fundamental fabric of our community neighborhoods.

When urban planning becomes divorced from ground realities, residents bear the uncompensated externalities: skyrocketing lease rates, fragmented schools, and the wholesale replacement of independent trades with speculative shell storefronts.

A truly accountable administration must implement comprehensive social impact audits prior to rezoning votes. Without objective ground metrics, growth is merely displacement by another name.`,
      authorName: 'David H. Vance',
      authorTitle: 'Senior Editorial Columnist',
      authorAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOgsVe1TMEQYu6j8BJIoL6LpMDoVlYH2A3ghSX1CDzkIb7QCq4uCi6IjE5Lt1IQb0ahhFTP1YgX4wlfsSjGYDcuDE9Vx05-LmgLiuHyBTha74sYtP7IXfciPNvdHN10BkugGpCbnh4LUv9E2JzbBh2gbXlkM3AiKq4XbQ3bJoE7aq1EHcTOXytVKt_DRvySr8Hn_jb09-_6dMrjtG69qZeT1WhJQIxwK2SHE0FHHNpoFmEgUtKR8oAWA',
      dateOrTimeAgo: '5 min read',
      category: 'Opinion',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOgsVe1TMEQYu6j8BJIoL6LpMDoVlYH2A3ghSX1CDzkIb7QCq4uCi6IjE5Lt1IQb0ahhFTP1YgX4wlfsSjGYDcuDE9Vx05-LmgLiuHyBTha74sYtP7IXfciPNvdHN10BkugGpCbnh4LUv9E2JzbBh2gbXlkM3AiKq4XbQ3bJoE7aq1EHcTOXytVKt_DRvySr8Hn_jb09-_6dMrjtG69qZeT1WhJQIxwK2SHE0FHHNpoFmEgUtKR8oAWA',
      isOpinion: true,
      readTime: '5 min read',
      views: '14.5k',
      viewCount: 14500,
      categoryTag: 'CIVIC',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'std_1',
      title: 'Tech Sector Job Growth Stalls in Q3',
      excerpt: 'Hiring contractions in software infrastructure ripple into commercial real estate portfolios across major metropolitan hubs.',
      fullContent: `Corporate payroll filings for the third quarter show a 4.2% slowdown in specialized engineering acquisitions across major technical hubs.

Analysts note that organizations are consolidating operational budgets toward compute automation and localized server infrastructure rather than personnel expansion. The downstream effect has led to an uptick in commercial subleasing activity.`,
      authorName: 'Claire Bennett',
      authorTitle: 'Economics Reporter',
      authorAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo2Zm8gfuBOIlL0oF01pJcZp_AO0LscocecKRW7B0I314yqz_PyLzzsChtSW4TMvEqUv6dLdMhgv0MJfDprQnVj0Wh2v5SNxq3MAHs_ObQ4GLeMfABdEzTKqvYD8cQ2r0kCzNLbvflG1lEFgdqCHO5XKKi6r9yN1EjAN8C_6i2xHdc3NXjK5PrqpvSPzdonO9hDQprub7leLDNzO-1DkaczxbPE86j5mQcah6dbedRIb5Pz-kekrQJCA',
      dateOrTimeAgo: 'Economics • 1 hr ago',
      category: 'Economics',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8NUjdHfAkQDf-Sk7zIMJognjeZdcikEt2cd-b-R9-Z3qyYCGndgTCvwCd2skINMqXHZ_07Rliz2Cf0gaoD59tsccrm3IOUrFZuXve4H7TKdbw14kyFsvJizSJ6lsLenqP8dp64CSPVku6vbFTBG-kObgYB495Y-tuA1Lhwn_s4KQrmeyspahlcqkeU1f4AKtGgrQn507FuvAAvGFq5bZ6_p3GJffZmegmvMKOB3ZXih77HR6MRaNdwQ',
      readTime: '3 min read',
      views: '8.9k',
      viewCount: 8900,
      categoryTag: 'ECONOMICS',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'std_2',
      title: 'Regional Power Grid Modernization Receives Federal Approval',
      excerpt: 'A 10-year grid resiliency initiative aims to replace vulnerable sub-stations before the impending winter storm cycle.',
      fullContent: `Federal regulators approved the multi-stage grid reinforcement program following two years of municipal engineering reviews. The initiative will allocate $420M towards redundant substation transformers and distributed battery backup facilities.`,
      authorName: 'Elias Thorne',
      authorTitle: 'Infrastructure Correspondent',
      authorAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByJne4Qwb-P_F0TU4UfX9xzAvqDm3Nlyhd__LQkUAzHvVbrWdeM-eyCU7rDdmkjNROjSE017nAoagBS5p7XsGXwdDf-o9ezd-oEBOguBVOuR1kmAgwcRxZwgPqSOYRRN6DjnHnhm_kl203eHMM58OLlsjwEhP5Jf7lt-MqiSxnx6F3tU4H7qrJsA05l_FOkCfThzR3UMoprtysOJlrP6iqok6QYPoVTC6ZErCUm4L4qywn3VopvOWQxA',
      dateOrTimeAgo: 'Infrastructure • 3 hrs ago',
      category: 'Infrastructure',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1Lj-WVucu3elFzPFEaWWopF8XkuQr2IIBGUyrAA7cqDoi3KLVvUCvuXKQmhxk6toNjNJ4poH2i2V4uahjuhUScqb6gDcG0VmXqZZ6nZZhPhDWVXhHuhOQ1c5Std9o6Fir_yb1Lc2cwcuuaFHhwwtg5UO18UR51_v--i7ZZH8VfpYtnxP04zbGvvQ9L_OhTxMSbaanWBrELaHFNHRxD5uZ7eeEm0P3gPyyUmWRDzSf3ot7MByfIlO-1w',
      readTime: '4 min read',
      views: '6.1k',
      viewCount: 6100,
      categoryTag: 'ENERGY',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prem_col_1',
      title: 'The Silent Erosion of Urban Privacy',
      excerpt: 'In the quiet corners of our bustling metropolises, a profound shift is occurring, largely unnoticed by the very citizens it affects most.',
      fullContent: `In the quiet corners of our bustling metropolises, a profound shift is occurring, largely unnoticed by the very citizens it affects most. The integration of "smart city" infrastructure, touted as the panacea for traffic congestion and resource mismanagement, has quietly ushered in an era of unprecedented surveillance.

We are trading our anonymity for convenience, a transaction that happens seamlessly every time we walk past a digital billboard or connect to public transit Wi-Fi.

What began as localized automated license plate recognition has evolved into an interconnected telemetry matrix. Municipal sensors now cross-correlate pedestrian density, cellular beacon handshakes, and micro-behavioral patterns under the banner of traffic optimization.

The ethical crisis does not lie merely in the collection of metadata, but in its unregulated commercialization. Private contractors operating municipal sensor arrays retain secondary analytical licensing rights, packaging civic movement streams for real estate arbitrage and targeted consumer profiling.

To reclaim civic dignity, municipal charters must enshrine cryptographic privacy guarantees as foundational civil rights.`,
      authorName: 'Sarah Jenkins',
      authorTitle: 'Senior Tech Correspondent',
      authorAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo2Zm8gfuBOIlL0oF01pJcZp_AO0LscocecKRW7B0I314yqz_PyLzzsChtSW4TMvEqUv6dLdMhgv0MJfDprQnVj0Wh2v5SNxq3MAHs_ObQ4GLeMfABdEzTKqvYD8cQ2r0kCzNLbvflG1lEFgdqCHO5XKKi6r9yN1EjAN8C_6i2xHdc3NXjK5PrqpvSPzdonO9hDQprub7leLDNzO-1DkaczxbPE86j5mQcah6dbedRIb5Pz-kekrQJCA',
      dateOrTimeAgo: 'Oct 18',
      category: 'Premium Column',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo2Zm8gfuBOIlL0oF01pJcZp_AO0LscocecKRW7B0I314yqz_PyLzzsChtSW4TMvEqUv6dLdMhgv0MJfDprQnVj0Wh2v5SNxq3MAHs_ObQ4GLeMfABdEzTKqvYD8cQ2r0kCzNLbvflG1lEFgdqCHO5XKKi6r9yN1EjAN8C_6i2xHdc3NXjK5PrqpvSPzdonO9hDQprub7leLDNzO-1DkaczxbPE86j5mQcah6dbedRIb5Pz-kekrQJCA',
      isPremium: true,
      readTime: '7 min read',
      views: '28.9k',
      viewCount: 28900,
      categoryTag: 'TECH & PRIVACY',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'author_art_1',
      title: 'Algorithm Apathy: Why We Stopped Caring How The Machine Works',
      excerpt: 'As predictive models dictate financial credit and judicial risk scoring, public resignation has replaced healthy technological skepticism.',
      fullContent: 'A critical exploration of how institutional reliance on black-box algorithmic scores has dampened civic demands for transparent code audits.',
      authorName: 'Sarah Jenkins',
      authorTitle: 'Senior Tech Correspondent',
      authorAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo2Zm8gfuBOIlL0oF01pJcZp_AO0LscocecKRW7B0I314yqz_PyLzzsChtSW4TMvEqUv6dLdMhgv0MJfDprQnVj0Wh2v5SNxq3MAHs_ObQ4GLeMfABdEzTKqvYD8cQ2r0kCzNLbvflG1lEFgdqCHO5XKKi6r9yN1EjAN8C_6i2xHdc3NXjK5PrqpvSPzdonO9hDQprub7leLDNzO-1DkaczxbPE86j5mQcah6dbedRIb5Pz-kekrQJCA',
      dateOrTimeAgo: 'Oct 12',
      category: 'Tech & Society',
      imageUrl: '',
      isAuthorColumn: true,
      readTime: '6 min read',
      views: '19.3k',
      viewCount: 19300,
      categoryTag: 'TECH & SOCIETY',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'author_art_2',
      title: 'The End of the Open Web is Closer Than You Think',
      excerpt: 'Walled platforms and proprietary search synthesizers are choking independent investigative publishers.',
      fullContent: 'Examining the tectonic shift from indexed decentralized web links toward walled synthetic answers that strip attribution from investigative journalism.',
      authorName: 'Sarah Jenkins',
      authorTitle: 'Senior Tech Correspondent',
      authorAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo2Zm8gfuBOIlL0oF01pJcZp_AO0LscocecKRW7B0I314yqz_PyLzzsChtSW4TMvEqUv6dLdMhgv0MJfDprQnVj0Wh2v5SNxq3MAHs_ObQ4GLeMfABdEzTKqvYD8cQ2r0kCzNLbvflG1lEFgdqCHO5XKKi6r9yN1EjAN8C_6i2xHdc3NXjK5PrqpvSPzdonO9hDQprub7leLDNzO-1DkaczxbPE86j5mQcah6dbedRIb5Pz-kekrQJCA',
      dateOrTimeAgo: 'Sep 28',
      category: 'Opinion',
      imageUrl: '',
      isAuthorColumn: true,
      readTime: '5 min read',
      views: '22.7k',
      viewCount: 22700,
      categoryTag: 'OPINION',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bento_1',
      title: "The Silent Collapse of District 4's Water Main",
      excerpt: 'Subsurface acoustic sensors detected structural stress 8 weeks before the catastrophic rupture.',
      fullContent: 'Investigative breakdown into aging municipal water piping and delayed maintenance reports in District 4.',
      authorName: 'Elias Thorne',
      authorTitle: 'Ground Expert',
      authorAvatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByJne4Qwb-P_F0TU4UfX9xzAvqDm3Nlyhd__LQkUAzHvVbrWdeM-eyCU7rDdmkjNROjSE017nAoagBS5p7XsGXwdDf-o9ezd-oEBOguBVOuR1kmAgwcRxZwgPqSOYRRN6DjnHnhm_kl203eHMM58OLlsjwEhP5Jf7lt-MqiSxnx6F3tU4H7qrJsA05l_FOkCfThzR3UMoprtysOJlrP6iqok6QYPoVTC6ZErCUm4L4qywn3VopvOWQxA',
      dateOrTimeAgo: 'Oct 12, 2023',
      category: 'Op-Ed',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1Lj-WVucu3elFzPFEaWWopF8XkuQr2IIBGUyrAA7cqDoi3KLVvUCvuXKQmhxk6toNjNJ4poH2i2V4uahjuhUScqb6gDcG0VmXqZZ6nZZhPhDWVXhHuhOQ1c5Std9o6Fir_yb1Lc2cwcuuaFHhwwtg5UO18UR51_v--i7ZZH8VfpYtnxP04zbGvvQ9L_OhTxMSbaanWBrELaHFNHRxD5uZ7eeEm0P3gPyyUmWRDzSf3ot7MByfIlO-1w',
      views: '12k',
      viewCount: 12000,
      isBentoPublished: true,
      categoryTag: 'OP-ED',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bento_2',
      title: 'City Council Clash: Transit Budget',
      excerpt: 'Heated negotiations on the floor as subway expansion timeline faces postponement.',
      fullContent: 'Eyewitness breakdown of transit council showdown.',
      authorName: 'Elias Thorne',
      authorTitle: 'Ground Expert',
      authorAvatarUrl: '',
      dateOrTimeAgo: 'Oct 10',
      category: 'Video Report',
      imageUrl: '',
      views: '8.4k',
      viewCount: 8400,
      isBentoPublished: true,
      categoryTag: 'TRANSIT',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bento_3',
      title: 'Opinion: Why the new zoning laws fail.',
      excerpt: 'A resident-first critique of municipal expansion directives.',
      fullContent: 'Critical evaluation of modern urban rezoning mandates.',
      authorName: 'Elias Thorne',
      authorTitle: 'Ground Expert',
      authorAvatarUrl: '',
      dateOrTimeAgo: 'Oct 05',
      category: 'Opinion',
      imageUrl: '',
      views: '15.1k',
      viewCount: 15100,
      isBentoPublished: true,
      categoryTag: 'OPINION',
      createdAt: new Date().toISOString(),
    },
  ];

  public liveVideos: VideoReport[] = [
    {
      id: 'vid_1',
      title: 'Market square protests escalate into the evening.',
      videoThumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtKQwtUQfNi0TaR0Zfq_mipPcVm0LN88opWdOTlOMhQCrWhXXIZVCQVCfRnDpL2a8hnBX1jXN_TuSTAODnubH-IOTCpkQWRRknY2vvIUjD0b7bZ2dcNxOX3oT6g6tkkxJeDd82XWy9ZddJleHN7OH15QXgLF3AsrJjvkwzFlwD3h0wUY7qfVKBXeLsFjFhQpkqunWqIxn-35zfTEwn6rlUN5dO4H-gUANdwf-g6Q9Jw5MCRmvmYY47lw',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isLive: true,
      isReplay: false,
      reporterName: 'Marcus Vance',
      location: 'Old City Market District',
      viewersCount: '4.8k watching',
      likesCount: 142,
      description: 'Live eyewitness coverage from the central bazaar where merchants and municipal officers are negotiating access cordons.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'vid_2',
      title: 'Aftermath of the severe storm in District 4.',
      videoThumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9A8-pW-PPz1f5ySdd5Mny_s8sNLQr5GO7AvE2x3NgCKzesgsFYKl4Qk_U6rEe-xIgNgvTnFWe5q1g_IcCO5OtJTtL-bpY77MRv7n7a0cQYtuB5GqmgTtL3-4j9ekNgMbVkUX_SREBYSKsYFvfPFSlP6tUCrGqDlpYgdf86MCFh1jjoy60mKWlbP6PjRxOaYOh3RmzFoqIk-MOdWM_vyOq2gWLax_mChFuQI_YtHbRlBUzzlVRSiVtPQ',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      isLive: false,
      isReplay: true,
      reporterName: 'Elena Rostova',
      location: 'Suburban Sector 4',
      viewersCount: '18.1k views',
      likesCount: 89,
      description: 'Emergency crews navigate heavy flooding and downed electrical infrastructure across suburban residential zones.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'vid_3',
      title: 'Press briefing: Transit union responds to fare restructuring.',
      videoThumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1Lj-WVucu3elFzPFEaWWopF8XkuQr2IIBGUyrAA7cqDoi3KLVvUCvuXKQmhxk6toNjNJ4poH2i2V4uahjuhUScqb6gDcG0VmXqZZ6nZZhPhDWVXhHuhOQ1c5Std9o6Fir_yb1Lc2cwcuuaFHhwwtg5UO18UR51_v--i7ZZH8VfpYtnxP04zbGvvQ9L_OhTxMSbaanWBrELaHFNHRxD5uZ7eeEm0P3gPyyUmWRDzSf3ot7MByfIlO-1w',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      isLive: false,
      isReplay: true,
      reporterName: 'Elias Thorne',
      location: 'Transit Authority Headquarters',
      viewersCount: '9.4k views',
      likesCount: 56,
      description: 'Union representatives outline grievance filings concerning reduced late-night transit schedules.',
      createdAt: new Date().toISOString(),
    },
  ];

  public submissions: Submission[] = [];

  public notifications: NotificationItem[] = [
    {
      id: 'notif_1',
      title: 'Urgent Ground Alert',
      message: 'City Council vote passes zoning restructure. Live dispatch active.',
      timeAgo: '10m ago',
      isUrgent: true,
      isRead: false,
      type: 'URGENT',
      targetArticleId: 'hero_1',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_2',
      title: 'Submission Update',
      message: "Your submission 'Downtown Protest Coverage' is currently under peer review.",
      timeAgo: '1h ago',
      isRead: false,
      type: 'SUBMISSION',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_3',
      title: 'New Column Published',
      message: "Sarah Jenkins published 'The Silent Erosion of Urban Privacy'.",
      timeAgo: '3h ago',
      isRead: false,
      type: 'EDITORIAL',
      targetArticleId: 'prem_col_1',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    },
  ];

  public categories: CategoryItem[] = [
    { id: 'cat_all', name: 'All', slug: 'all', description: 'All top breaking and ground dispatches' },
    { id: 'cat_urgent', name: 'Urgent', slug: 'urgent', description: 'High priority breaking dispatches' },
    { id: 'cat_ground', name: 'Ground Reports', slug: 'ground-reports', description: 'Eyewitness citizen journalism and ground coverage' },
    { id: 'cat_opinion', name: 'Opinion', slug: 'opinion', description: 'Expert editorials and community viewpoints' },
    { id: 'cat_econ', name: 'Economics', slug: 'economics', description: 'Financial markets and business policy' },
    { id: 'cat_infra', name: 'Infrastructure', slug: 'infrastructure', description: 'Urban planning, grid & transit networks' },
  ];

  public sponsoredBanner: SponsoredBanner = {
    id: 'sponsor_1',
    title: 'Susalabs Research Initiative',
    sponsorName: 'Susalabs Intelligence',
    subtitle: 'Decentralized cryptographic verification protocol for modern civic reporting.',
    badge: 'COMMUNITY SPONSOR',
    ctaText: 'LEARN MORE',
    actionUrl: 'https://susalabs.com',
  };
}

export const db = new DataStore();
