using System;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using CmdManager.Models;
using CmdManager.ViewModels;

namespace CmdManager.Views
{
    public partial class GroupsPage : Page
    {
        private AppViewModel VM => MainWindow.VM;
        private string _search = "";

        public GroupsPage()
        {
            InitializeComponent();
            Refresh();
        }

        private void Refresh()
        {
            GroupList.Children.Clear();
            var filtered = VM.Groups
                .Where(g => g.Name.Contains(_search, StringComparison.OrdinalIgnoreCase) ||
                            g.Description.Contains(_search, StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (filtered.Count == 0)
            {
                GroupList.Children.Add(new TextBlock
                {
                    Text = _search.Length > 0 ? "No groups match your search." : "No groups yet. Create one to get started.",
                    FontSize = 14, Margin = new Thickness(8),
                    Foreground = (Brush)FindResource("MutedTextBrush")
                });
                return;
            }

            foreach (var group in filtered)
                GroupList.Children.Add(MakeGroupCard(group));
        }

        private UIElement MakeGroupCard(Group group)
        {
            var cmds = VM.Commands.Where(c => group.CommandIds.Contains(c.Id)).ToList();
            var chains = VM.Chains.Where(c => group.ChainIds.Contains(c.Id)).ToList();
            var regs = VM.RegistryCommands.Where(c => group.RegistryIds.Contains(c.Id)).ToList();
            int total = cmds.Count + chains.Count + regs.Count;

            var outer = new Border
            {
                Background = (Brush)FindResource("CardBrush"),
                BorderBrush = (Brush)FindResource("BorderBrush"),
                BorderThickness = new Thickness(1), CornerRadius = new CornerRadius(12),
                Margin = new Thickness(0, 0, 0, 12)
            };

            var stack = new StackPanel();

            // Header
            var header = new Grid { Margin = new Thickness(16, 14, 16, 14), Cursor = System.Windows.Input.Cursors.Hand };
            header.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            header.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            header.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var iconBorder = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(0x22, 0x63, 0x66, 0xF1)),
                CornerRadius = new CornerRadius(8), Padding = new Thickness(8),
                Margin = new Thickness(0, 0, 12, 0), VerticalAlignment = VerticalAlignment.Top
            };
            iconBorder.Child = new TextBlock { Text = "📁", FontSize = 16 };
            Grid.SetColumn(iconBorder, 0);
            header.Children.Add(iconBorder);

            var infoStack = new StackPanel();
            var nameLine = new StackPanel { Orientation = Orientation.Horizontal };
            nameLine.Children.Add(new TextBlock
            {
                Text = group.Name, FontSize = 15, FontWeight = FontWeights.SemiBold,
                Foreground = (Brush)FindResource("TextBrush"), VerticalAlignment = VerticalAlignment.Center
            });
            if (total > 0)
                nameLine.Children.Add(new Border
                {
                    Background = new SolidColorBrush(Color.FromArgb(0x33, 0xFF, 0xFF, 0xFF)),
                    CornerRadius = new CornerRadius(10), Padding = new Thickness(7, 2, 7, 2),
                    Margin = new Thickness(8, 0, 0, 0), VerticalAlignment = VerticalAlignment.Center,
                    Child = new TextBlock
                    {
                        Text = $"{total} item{(total != 1 ? "s" : "")}",
                        FontSize = 11, Foreground = (Brush)FindResource("MutedTextBrush")
                    }
                });
            infoStack.Children.Add(nameLine);
            if (!string.IsNullOrWhiteSpace(group.Description))
                infoStack.Children.Add(new TextBlock
                {
                    Text = group.Description, FontSize = 12,
                    Foreground = (Brush)FindResource("MutedTextBrush"),
                    TextTrimming = TextTrimming.CharacterEllipsis, Margin = new Thickness(0, 2, 0, 0)
                });

            var countLine = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 6, 0, 0) };
            if (cmds.Count > 0)   countLine.Children.Add(MakeCountBadge($"⌨ {cmds.Count} Commands", "#FF6366F1"));
            if (chains.Count > 0) countLine.Children.Add(MakeCountBadge($"⛓ {chains.Count} Chains", "#FF8B5CF6"));
            if (regs.Count > 0)   countLine.Children.Add(MakeCountBadge($"🗄 {regs.Count} Registry", "#FFF97316"));
            if (total == 0)       countLine.Children.Add(new TextBlock { Text = "Empty group", FontSize = 11, FontStyle = FontStyles.Italic, Foreground = (Brush)FindResource("MutedTextBrush") });
            infoStack.Children.Add(countLine);

            Grid.SetColumn(infoStack, 1);
            header.Children.Add(infoStack);

            // Buttons
            var btnPanel = new StackPanel { Orientation = Orientation.Horizontal, VerticalAlignment = VerticalAlignment.Top };
            var editBtn = new Button { Content = "✏", Style = (Style)FindResource("GhostButton"), Padding = new Thickness(7, 5, 7, 5), Margin = new Thickness(0, 0, 4, 0) };
            editBtn.Click += (s, e) => EditGroup(group);
            var delBtn = new Button { Content = "🗑", Style = (Style)FindResource("DangerButton"), Padding = new Thickness(7, 5, 7, 5) };
            delBtn.Click += (s, e) => DeleteGroup(group);
            btnPanel.Children.Add(editBtn);
            btnPanel.Children.Add(delBtn);
            Grid.SetColumn(btnPanel, 2);
            header.Children.Add(btnPanel);

            stack.Children.Add(header);

            // Expanded content (always shown in WPF for simplicity)
            if (total > 0)
            {
                var divider = new Border { Height = 1, Background = (Brush)FindResource("BorderBrush"), Margin = new Thickness(0) };
                stack.Children.Add(divider);

                var content = new StackPanel { Margin = new Thickness(16, 12, 16, 12) };
                if (cmds.Count > 0)
                {
                    content.Children.Add(MakeSectionHeader("Commands", "#FF6366F1"));
                    foreach (var c in cmds) content.Children.Add(MakeSectionItem(c.Name, c.CommandText));
                }
                if (chains.Count > 0)
                {
                    content.Children.Add(MakeSectionHeader("Command Chains", "#FF8B5CF6"));
                    foreach (var c in chains) content.Children.Add(MakeSectionItem(c.Name, $"{c.Steps.Count} steps"));
                }
                if (regs.Count > 0)
                {
                    content.Children.Add(MakeSectionHeader("Registry Commands", "#FFF97316"));
                    foreach (var c in regs) content.Children.Add(MakeSectionItem(c.Name, c.CommandText.Length > 50 ? c.CommandText[..50] + "…" : c.CommandText));
                }
                stack.Children.Add(content);
            }

            outer.Child = stack;
            return outer;
        }

        private UIElement MakeCountBadge(string text, string color)
        {
            var c = (Color)ColorConverter.ConvertFromString(color);
            return new TextBlock
            {
                Text = text, FontSize = 11, Margin = new Thickness(0, 0, 10, 0),
                Foreground = new SolidColorBrush(c)
            };
        }

        private UIElement MakeSectionHeader(string title, string color)
        {
            var c = (Color)ColorConverter.ConvertFromString(color);
            var border = new Border
            {
                Background = new SolidColorBrush(Color.FromArgb(0x15, c.R, c.G, c.B)),
                BorderBrush = new SolidColorBrush(Color.FromArgb(0x33, c.R, c.G, c.B)),
                BorderThickness = new Thickness(0, 0, 0, 1), Padding = new Thickness(10, 6, 10, 6),
                Margin = new Thickness(0, 4, 0, 0), CornerRadius = new CornerRadius(6, 6, 0, 0)
            };
            border.Child = new TextBlock
            {
                Text = title.ToUpper(), FontSize = 11, FontWeight = FontWeights.SemiBold,
                Foreground = new SolidColorBrush(c), LetterSpacing = 0.5
            };
            return border;
        }

        private UIElement MakeSectionItem(string name, string detail)
        {
            var grid = new Grid
            {
                Background = new SolidColorBrush(Color.FromArgb(0x0A, 0xFF, 0xFF, 0xFF)),
                Margin = new Thickness(0), Height = 36
            };
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            grid.Children.Add(new TextBlock
            {
                Text = name, FontSize = 13, FontWeight = FontWeights.Medium,
                Foreground = (Brush)FindResource("TextBrush"),
                VerticalAlignment = VerticalAlignment.Center, Margin = new Thickness(10, 0, 8, 0)
            });
            var detailTb = new TextBlock
            {
                Text = detail, FontSize = 11, FontFamily = (FontFamily)FindResource("MonoFont"),
                Foreground = (Brush)FindResource("MutedTextBrush"),
                VerticalAlignment = VerticalAlignment.Center, Margin = new Thickness(0, 0, 10, 0),
                TextTrimming = TextTrimming.CharacterEllipsis, MaxWidth = 220
            };
            Grid.SetColumn(detailTb, 1);
            grid.Children.Add(detailTb);
            return grid;
        }

        private void EditGroup(Group group)
        {
            var dlg = new GroupFormDialog(group) { Owner = Window.GetWindow(this) };
            if (dlg.ShowDialog() == true)
            {
                VM.UpdateGroup(dlg.Result!);
                Refresh();
            }
        }

        private void DeleteGroup(Group group)
        {
            if (MessageBox.Show($"Delete group \"{group.Name}\"?", "Delete", MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes)
            {
                VM.DeleteGroup(group.Id);
                Refresh();
            }
        }

        private void AddGroup_Click(object sender, RoutedEventArgs e)
        {
            var dlg = new GroupFormDialog(null) { Owner = Window.GetWindow(this) };
            if (dlg.ShowDialog() == true)
            {
                VM.AddGroup(dlg.Result!);
                Refresh();
            }
        }

        private void Search_Changed(object sender, TextChangedEventArgs e) { _search = SearchBox.Text; Refresh(); }
    }
}
