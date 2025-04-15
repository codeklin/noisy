import { saveAs } from 'file-saver';
import { Post, PostPlan, BrandInfo } from '@/types';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Save the generated content plan to localStorage
export const saveToLocalStorage = (
  posts: PostPlan, 
  brandInfo: BrandInfo | null,
  generatedDate: string | null = null
) => {
  try {
    localStorage.setItem('contentPlan', JSON.stringify(posts));
    if (brandInfo) {
      localStorage.setItem('brandInfo', JSON.stringify(brandInfo));
    }
    if (generatedDate) {
      localStorage.setItem('generatedDate', generatedDate);
    }
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

// Load the saved content plan from localStorage
export const loadFromLocalStorage = () => {
  try {
    const postsString = localStorage.getItem('contentPlan');
    const brandInfoString = localStorage.getItem('brandInfo');
    const generatedDate = localStorage.getItem('generatedDate');
    
    return {
      posts: postsString ? JSON.parse(postsString) : null,
      brandInfo: brandInfoString ? JSON.parse(brandInfoString) : null,
      generatedDate
    };
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return { posts: null, brandInfo: null, generatedDate: null };
  }
};

// Function to export content plan to PDF
export const exportToPDF = async (posts: PostPlan, platform: 'facebook' | 'twitter' | 'linkedin' | 'all') => {
  const filteredPosts = platform === 'all' ? posts : posts.filter(post => post.platform === platform);

  if (filteredPosts.length === 0) {
    alert(`No posts available for ${platform}.`);
    return;
  }

  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: `Content Plan for ${platform}`,
    subject: 'Generated Content Plan',
    author: 'Postit',
    keywords: 'content plan, social media'
  });

  // Add title
  doc.text(`Content Plan for ${platform}`, 10, 10);

  // Prepare data for the table
  const data = filteredPosts.map(post => [
    post.date,
    post.platform,
    post.content,
    post.hashtags.join(', ')
  ]);

  // Define table headers
  const headers = ['Date', 'Platform', 'Content', 'Hashtags'];

  // Add the table to the PDF
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 20,
  });

  // Save the PDF
  doc.save(`content_plan_${platform}.pdf`);
};

// Function to export content plan to DOCX
export const exportToDOCX = async (posts: PostPlan, platform: 'facebook' | 'twitter' | 'linkedin' | 'all') => {
  const filteredPosts = platform === 'all' ? posts : posts.filter(post => post.platform === platform);

  if (filteredPosts.length === 0) {
    alert(`No posts available for ${platform}.`);
    return;
  }

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: `Content Plan for ${platform}`,
              bold: true,
              size: '36pt',
            }),
          ],
        }),
        ...filteredPosts.map(post => new Paragraph({
          children: [
            new TextRun({
              text: `${post.date} - ${post.platform}`,
              bold: true,
            }),
            new TextRun({
              text: `\n${post.content}`,
            }),
            new TextRun({
              text: `\nHashtags: ${post.hashtags.join(', ')}`,
              italics: true,
            }),
            new TextRun({
              text: `\n\n`,
            }),
          ],
        })),
      ],
    }],
  });

  // Used to export and download the document using FileSaver.js
  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `content_plan_${platform}.docx`);
  });
};
