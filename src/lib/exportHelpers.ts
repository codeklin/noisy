
import { Post, PostPlan } from "@/types";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle } from "docx";

// Create PDF export
export const exportToPDF = async (posts: PostPlan, platform: string = 'all') => {
  const now = new Date();
  const fileName = `content-plan-${platform}-${format(now, 'yyyy-MM-dd')}.pdf`;
  
  // Filter posts if a specific platform is selected
  const filteredPosts = platform === 'all' 
    ? posts 
    : posts.filter(post => post.platform === platform);
    
  // Group posts by date for better organization
  const postsByDate: { [key: string]: Post[] } = {};
  
  filteredPosts.forEach(post => {
    if (!postsByDate[post.date]) {
      postsByDate[post.date] = [];
    }
    postsByDate[post.date].push(post);
  });
  
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add title
  doc.setFontSize(18);
  doc.text(`Social Media Content Plan - ${platform.charAt(0).toUpperCase() + platform.slice(1)}`, 15, 15);
  doc.setFontSize(12);
  doc.text(`Generated on ${format(now, 'MMMM d, yyyy')}`, 15, 25);
  
  // Start Y position for the content
  let yPos = 35;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Create content for each date
  Object.keys(postsByDate).sort().forEach(date => {
    const formattedDate = format(new Date(date), 'MMMM d, yyyy');
    
    // Check if we need to add a new page
    if (yPos > 260) {
      doc.addPage();
      yPos = 15;
    }
    
    // Add date header
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(formattedDate, 15, yPos);
    yPos += 7;
    
    // Add each post for this date
    postsByDate[date].forEach(post => {
      // Check if we need to add a new page
      if (yPos > 260) {
        doc.addPage();
        yPos = 15;
      }
      
      // Add platform name
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`Platform: ${post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}`, 15, yPos);
      yPos += 6;
      
      // Add post content
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      // Split long text into multiple lines
      const contentLines = doc.splitTextToSize(post.content, contentWidth);
      doc.text(contentLines, 15, yPos);
      yPos += (contentLines.length * 5) + 2;
      
      // Add hashtags
      if (post.hashtags.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Hashtags: #${post.hashtags.join(' #')}`, 15, yPos);
        yPos += 8;
      }
      
      // Add separator line
      doc.setDrawColor(220, 220, 220);
      doc.line(15, yPos, pageWidth - 15, yPos);
      yPos += 10;
    });
  });
  
  // Save the PDF
  doc.save(fileName);
  
  return fileName;
};

// Create DOCX export
export const exportToDOCX = async (posts: PostPlan, platform: string = 'all') => {
  const now = new Date();
  const fileName = `content-plan-${platform}-${format(now, 'yyyy-MM-dd')}.docx`;
  
  // Filter posts if a specific platform is selected
  const filteredPosts = platform === 'all'
    ? posts
    : posts.filter(post => post.platform === platform);
    
  // Group posts by date for better organization
  const postsByDate: { [key: string]: Post[] } = {};
  
  filteredPosts.forEach(post => {
    if (!postsByDate[post.date]) {
      postsByDate[post.date] = [];
    }
    postsByDate[post.date].push(post);
  });
  
  // Create document sections
  const sections = [];
  
  // Create title section
  const titleParagraph = new Paragraph({
    children: [
      new TextRun({
        text: `Social Media Content Plan - ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        bold: true,
        size: 32
      })
    ]
  });
  
  const dateParagraph = new Paragraph({
    children: [
      new TextRun({
        text: `Generated on ${format(now, 'MMMM d, yyyy')}`,
        size: 24
      })
    ],
    spacing: {
      after: 400
    }
  });
  
  sections.push(titleParagraph, dateParagraph);
  
  // Create content sections for each date
  Object.keys(postsByDate).sort().forEach(date => {
    const formattedDate = format(new Date(date), 'MMMM d, yyyy');
    
    // Date header
    const dateHeader = new Paragraph({
      children: [
        new TextRun({
          text: formattedDate,
          bold: true,
          size: 28
        })
      ],
      spacing: {
        before: 400,
        after: 200
      }
    });
    
    sections.push(dateHeader);
    
    // Add each post for this date
    postsByDate[date].forEach(post => {
      // Platform name
      const platformParagraph = new Paragraph({
        children: [
          new TextRun({
            text: `Platform: ${post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}`,
            bold: true,
            size: 24
          })
        ],
        spacing: {
          before: 200,
          after: 100
        }
      });
      
      // Post content
      const contentParagraph = new Paragraph({
        children: [
          new TextRun({
            text: post.content,
            size: 22
          })
        ],
        spacing: {
          after: 100
        }
      });
      
      // Hashtags
      const hashtagsParagraph = new Paragraph({
        children: [
          new TextRun({
            text: `Hashtags: #${post.hashtags.join(' #')}`,
            italics: true,
            size: 20
          })
        ],
        spacing: {
          after: 100
        }
      });
      
      // Separator
      const separatorParagraph = new Paragraph({
        children: [
          new TextRun({
            text: "------------------------------------------------------",
            color: "999999"
          })
        ],
        spacing: {
          after: 200
        }
      });
      
      sections.push(platformParagraph, contentParagraph, hashtagsParagraph, separatorParagraph);
    });
  });
  
  // Create the document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections
      }
    ]
  });
  
  // Generate and save the document
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  saveAs(blob, fileName);
  
  return fileName;
};

// Save to local storage
export const saveToLocalStorage = (posts: PostPlan, brandInfo: any) => {
  try {
    localStorage.setItem('contentPlan', JSON.stringify(posts));
    localStorage.setItem('brandInfo', JSON.stringify(brandInfo));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Load from local storage
export const loadFromLocalStorage = () => {
  try {
    const posts = localStorage.getItem('contentPlan');
    const brandInfo = localStorage.getItem('brandInfo');
    
    return {
      posts: posts ? JSON.parse(posts) : null,
      brandInfo: brandInfo ? JSON.parse(brandInfo) : null
    };
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return { posts: null, brandInfo: null };
  }
};
